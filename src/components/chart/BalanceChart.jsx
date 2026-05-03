import { useId, useMemo } from 'react';
import { fmtDate } from '../../utils/date.js';
import { fmtKRW, fmtKRWShort } from '../../utils/format.js';
import { scaleX, scaleY, smoothPath } from '../../utils/chart.js';

/**
 * 듀얼 라인 차트 — 누적 수입 / 누적 지출.
 *
 * 1) records 를 일별 버킷으로 모아서
 * 2) 윈도우(currentRange 일수) 동안의 누적 시리즈를 만들고
 * 3) 두 라인 + 영역, 그리고 일별 거래량 막대를 SVG 로 그린다.
 *
 * 점을 클릭하면 selectedIdx 가 갱신되어 핀 정보를 보여준다.
 */

const W = 400;
const H = 220;
const PADL = 6;
const PADR = 6;
const PADT = 10;
const PADB = 14;

const VW = 400;
const VH = 60;

export default function BalanceChart({
  records,
  rangeDays,
  inColor,
  outColor,
  selectedIdx,
  onSelectIdx,
}) {
  // ---------------------------------------------------------------
  // 차트 데이터 가공 (기간 범위 안에서만 누적)
  // ---------------------------------------------------------------
  const { series, startIn, startOut } = useMemo(
    () => buildSeries(records, rangeDays),
    [records, rangeDays]
  );

  // 그라데이션 ID 충돌 방지 — useId 로 안정적인 유니크 값
  // (early return 전에 호출해서 hooks 순서 일정 유지)
  const gid = useId().replace(/:/g, '');
  const gInId = `gi_${gid}`;
  const gOutId = `go_${gid}`;

  // 데이터 없음 — 안내 텍스트만
  if (series.length === 0) {
    return (
      <ChartFrame
        nowLabel="₩0"
        delta={null}
        inColor={inColor}
        outColor={outColor}
        startEndDates={null}
      >
        <svg className="balance-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
          <text
            x="200"
            y="110"
            textAnchor="middle"
            fontSize="14"
            fill="#8A8FA3"
            fontFamily="Pretendard"
          >
            내역이 없습니다
          </text>
        </svg>
      </ChartFrame>
    );
  }

  // ---------------------------------------------------------------
  // y 축 스케일 — 두 시리즈 중 큰 값을 기준, 위/아래 12% 패딩
  // ---------------------------------------------------------------
  let yMin = Math.min(
    startIn,
    startOut,
    ...series.map((s) => Math.min(s.cumIn, s.cumOut))
  );
  let yMax = Math.max(1, ...series.map((s) => Math.max(s.cumIn, s.cumOut)));
  if (yMin === yMax) yMax = yMin + 1;
  const padY = (yMax - yMin) * 0.12;
  yMin = Math.max(0, yMin - padY);
  yMax += padY;

  const x = (i) => scaleX(i, series.length, W, PADL, PADR);
  const y = (v) => scaleY(v, yMin, yMax, H, PADT, PADB);

  const inPts = series.map((s, i) => [x(i), y(s.cumIn)]);
  const outPts = series.map((s, i) => [x(i), y(s.cumOut)]);

  const dIn = smoothPath(inPts);
  const dOut = smoothPath(outPts);
  const baseY = H - PADB;
  const dInArea = `${dIn} L ${inPts[inPts.length - 1][0]} ${baseY} L ${inPts[0][0]} ${baseY} Z`;
  const dOutArea = `${dOut} L ${outPts[outPts.length - 1][0]} ${baseY} L ${outPts[0][0]} ${baseY} Z`;

  // ---------------------------------------------------------------
  // 헤더용: 현재 잔액 / 기간 내 변동량
  // ---------------------------------------------------------------
  const last = series[series.length - 1];
  const balance = last.cumIn - last.cumOut;
  const startBal = startIn - startOut;
  const delta = balance - startBal;

  // ---------------------------------------------------------------
  // 시작/종료 날짜 라벨
  // ---------------------------------------------------------------
  const startEndDates = (() => {
    if (series.length === 0) return null;
    const fmt = (s) => {
      const [y1, m1, d1] = s.split('-');
      return `${y1}.${m1}.${d1}`;
    };
    return {
      first: fmt(series[0].date),
      last: series.length >= 2 ? fmt(series[series.length - 1].date) : '',
    };
  })();

  // ---------------------------------------------------------------
  // 거래량 미니 차트
  // ---------------------------------------------------------------
  const maxVol = Math.max(1, ...series.map((s) => Math.max(s.in, s.out)));
  const xv = (i) => scaleX(i, series.length, VW, PADL, PADR);
  const cellW = (VW - PADL - PADR) / Math.max(series.length, 1);
  const barW = Math.max(1.5, Math.min(cellW * 0.35, 6));

  return (
    <ChartFrame
      nowLabel={fmtKRW(balance)}
      delta={delta}
      inColor={inColor}
      outColor={outColor}
      startEndDates={startEndDates}
    >
      {/* ---- 누적 라인 차트 ---- */}
      <svg className="balance-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gInId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={inColor} stopOpacity={0.28} />
            <stop offset="100%" stopColor={inColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={gOutId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={outColor} stopOpacity={0.28} />
            <stop offset="100%" stopColor={outColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* 가이드 라인 — 4분할 점선 */}
        {[1, 2, 3].map((i) => {
          const gy = PADT + ((H - PADT - PADB) * i) / 4;
          return (
            <line
              key={i}
              x1={PADL}
              y1={gy}
              x2={W - PADR}
              y2={gy}
              stroke="#E6E8F0"
              strokeWidth={1}
              strokeDasharray="2 4"
              opacity={0.6}
            />
          );
        })}

        {/* 영역 (글로우) + 라인 */}
        <path d={dOutArea} fill={`url(#${gOutId})`} />
        <path d={dInArea} fill={`url(#${gInId})`} />
        <path
          d={dOut}
          fill="none"
          stroke={outColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={dIn}
          fill="none"
          stroke={inColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 데이터 포인트 — 60개 이하 일 때만 모든 점 표시 (1년치 등 너무 많으면 생략) */}
        {series.length <= 60 &&
          series.map((s, i) => {
            const px = x(i);
            return (
              <g key={i}>
                <circle
                  cx={px}
                  cy={y(s.cumIn)}
                  r={2}
                  fill="#fff"
                  stroke={inColor}
                  strokeWidth={1.5}
                />
                <circle
                  cx={px}
                  cy={y(s.cumOut)}
                  r={2}
                  fill="#fff"
                  stroke={outColor}
                  strokeWidth={1.5}
                />
              </g>
            );
          })}

        {/* 마지막 시점 강조용 큰 점 */}
        <circle cx={inPts[inPts.length - 1][0]} cy={inPts[inPts.length - 1][1]} r={5} fill={inColor} />
        <circle
          cx={inPts[inPts.length - 1][0]}
          cy={inPts[inPts.length - 1][1]}
          r={9}
          fill={inColor}
          opacity={0.2}
        />
        <circle cx={outPts[outPts.length - 1][0]} cy={outPts[outPts.length - 1][1]} r={5} fill={outColor} />
        <circle
          cx={outPts[outPts.length - 1][0]}
          cy={outPts[outPts.length - 1][1]}
          r={9}
          fill={outColor}
          opacity={0.2}
        />

        {/* 선택된 점 강조 */}
        {selectedIdx != null && selectedIdx < series.length && (
          <g>
            <line
              x1={x(selectedIdx)}
              y1={PADT}
              x2={x(selectedIdx)}
              y2={H - PADB}
              stroke="var(--ink-3)"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.4}
            />
            <circle
              cx={x(selectedIdx)}
              cy={y(series[selectedIdx].cumIn)}
              r={7}
              fill={inColor}
              opacity={0.35}
            />
            <circle
              cx={x(selectedIdx)}
              cy={y(series[selectedIdx].cumOut)}
              r={7}
              fill={outColor}
              opacity={0.35}
            />
            <circle cx={x(selectedIdx)} cy={y(series[selectedIdx].cumIn)} r={4} fill={inColor} />
            <circle cx={x(selectedIdx)} cy={y(series[selectedIdx].cumOut)} r={4} fill={outColor} />
          </g>
        )}

        {/* 클릭 영역 — 데이터 점 위/아래 전체를 덮는 보이지 않는 사각형 */}
        {series.map((_, i) => {
          const cell = (W - PADL - PADR) / Math.max(series.length, 1);
          return (
            <rect
              key={i}
              x={x(i) - cell / 2}
              y={0}
              width={cell}
              height={H}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                onSelectIdx(selectedIdx === i ? null : i);
              }}
            />
          );
        })}
      </svg>

      {/* ---- 거래량 막대 ---- */}
      <svg className="vol-chart" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none">
        {series.map((s, i) => {
          const cx = xv(i);
          return (
            <g key={i}>
              {s.in > 0 && (
                <rect
                  x={cx - barW - 1}
                  y={VH - (s.in / maxVol) * (VH * 0.9)}
                  width={barW}
                  height={(s.in / maxVol) * (VH * 0.9)}
                  fill={inColor}
                  rx={1.5}
                />
              )}
              {s.out > 0 && (
                <rect
                  x={cx + 1}
                  y={VH - (s.out / maxVol) * (VH * 0.9)}
                  width={barW}
                  height={(s.out / maxVol) * (VH * 0.9)}
                  fill={outColor}
                  rx={1.5}
                />
              )}
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}

/* =======================================================
   하위 컴포넌트 — 차트의 외곽 프레임 (제목/델타/날짜라벨/범례)
   ======================================================= */
function ChartFrame({ nowLabel, delta, inColor, outColor, startEndDates, children }) {
  let deltaCls = 'flat';
  let deltaLabel = '—';
  if (delta != null) {
    if (delta > 0) {
      deltaCls = 'up';
      deltaLabel = '▲ ' + fmtKRWShort(delta);
    } else if (delta < 0) {
      deltaCls = 'down';
      deltaLabel = '▼ ' + fmtKRWShort(delta);
    } else {
      deltaCls = 'flat';
      deltaLabel = '— 변동없음';
    }
  }

  return (
    <div className="chart-wrap">
      <div className="hdr-mini">
        <div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--ink-3)',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            현재 잔액
          </div>
          <div className="now-val">{nowLabel}</div>
        </div>
        <div className={`delta ${deltaCls}`}>{deltaLabel}</div>
      </div>

      {children}

      {startEndDates && (
        <div className="chart-dates">
          <span>{startEndDates.first}</span>
          <span>{startEndDates.last}</span>
        </div>
      )}

      <div className="chart-legend">
        <span>
          <span className="dot" style={{ background: inColor }} />
          수입
        </span>
        <span>
          <span className="dot" style={{ background: outColor }} />
          지출
        </span>
      </div>
    </div>
  );
}

/* =======================================================
   순수 함수 — series 만들기
   ======================================================= */
/**
 * 일별 records → 누적 시리즈로 변환.
 * 윈도우 시작 이전에 발생한 거래는 startIn / startOut 으로 합산되어 0 에서 시작하지 않게 한다.
 */
function buildSeries(records, rangeDays) {
  // 일자별 in/out 합산
  const byDay = {};
  records.forEach((r) => {
    if (r.kind === 'workout') return;
    if (!byDay[r.date]) byDay[r.date] = { in: 0, out: 0 };
    if (r.kind === 'income') byDay[r.date].in += r.amount;
    if (r.kind === 'expense') byDay[r.date].out += r.amount;
  });

  // 오늘 포함 직전 N일을 모두 채운 날짜 배열
  const days = [];
  const today = new Date();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(fmtDate(d));
  }

  // 윈도우 시작 이전 누적값
  let startIn = 0;
  let startOut = 0;
  if (days.length) {
    const windowStart = days[0];
    records.forEach((r) => {
      if (r.kind === 'workout') return;
      if (r.date < windowStart) {
        if (r.kind === 'income') startIn += r.amount;
        if (r.kind === 'expense') startOut += r.amount;
      }
    });
  }

  // 누적 시리즈
  const series = [];
  let cumIn = startIn;
  let cumOut = startOut;
  days.forEach((d) => {
    const v = byDay[d] || { in: 0, out: 0 };
    cumIn += v.in;
    cumOut += v.out;
    series.push({ date: d, in: v.in, out: v.out, cumIn, cumOut });
  });

  return { series, startIn, startOut };
}
