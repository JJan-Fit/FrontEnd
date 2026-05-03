import { useId } from 'react';
import { scaleX, scaleY, smoothPath } from '../../utils/chart.js';

/**
 * 일자별 몸무게 트렌드 라인.
 *
 * 데이터가 없으면 안내 문구만 표시. 1개만 있으면 가운데에 점 하나.
 *
 * @param {{ pts: { date: string, v: number }[] }} props
 */
const W = 400;
const H = 120;
const PADL = 6;
const PADR = 6;
const PADT = 8;
const PADB = 8;

export default function WeightChart({ pts }) {
  // useId 는 어떤 분기든 호출되도록 컴포넌트 최상단에 둔다 (hooks 규칙)
  const gid = 'wg_' + useId().replace(/:/g, '');

  if (!pts || pts.length === 0) {
    return (
      <div className="empty-small">몸무게를 입력하면 차트가 생겨요 📊</div>
    );
  }

  const vs = pts.map((p) => p.v);
  let yMin = Math.min(...vs);
  let yMax = Math.max(...vs);
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  }
  // 위/아래에 20% 여백 — 한 점만 있을 때나 변동이 적을 때 시각적으로 자연스럽게
  const padY = (yMax - yMin) * 0.2;
  yMin -= padY;
  yMax += padY;

  const x = (i) => scaleX(i, pts.length, W, PADL, PADR);
  const y = (v) => scaleY(v, yMin, yMax, H, PADT, PADB);

  const linePts = pts.map((p, i) => [x(i), y(p.v)]);
  const d = smoothPath(linePts);
  const dArea = `${d} L ${x(pts.length - 1)} ${H - PADB} L ${x(0)} ${H - PADB} Z`;

  return (
    <>
      <svg className="weight-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7A5BBF" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#7A5BBF" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={dArea} fill={`url(#${gid})`} />
        <path
          d={d}
          fill="none"
          stroke="#7A5BBF"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {pts.map((p, i) => (
          <circle
            key={p.date}
            cx={x(i)}
            cy={y(p.v)}
            r={2.5}
            fill="#fff"
            stroke="#7A5BBF"
            strokeWidth={1.5}
          />
        ))}
        <circle cx={x(pts.length - 1)} cy={y(pts[pts.length - 1].v)} r={4} fill="#7A5BBF" />
        <circle
          cx={x(pts.length - 1)}
          cy={y(pts[pts.length - 1].v)}
          r={8}
          fill="#7A5BBF"
          opacity={0.2}
        />
      </svg>
    </>
  );
}
