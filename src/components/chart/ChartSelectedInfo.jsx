import { useMemo } from 'react';
import { fmtDate } from '../../utils/date.js';
import { fmtKRW, fmtKRWShort } from '../../utils/format.js';

/**
 * 차트에서 한 점을 클릭했을 때 상단에 핀 고정되는 정보 박스.
 *
 * BalanceChart 와 series 계산 로직이 같지만, 본문에 표시할 단일 시점 정보만 필요하므로
 * 별도로 가볍게 다시 계산한다. (성능 부담은 거의 없음)
 *
 * @param {{
 *   records: any[],
 *   rangeDays: number,
 *   selectedIdx: number | null,
 *   onClose: () => void,
 * }} props
 */
export default function ChartSelectedInfo({ records, rangeDays, selectedIdx, onClose }) {
  const series = useMemo(() => buildSeries(records, rangeDays), [records, rangeDays]);

  if (selectedIdx == null || selectedIdx >= series.length) {
    return <div className="chart-selected" />; // 보이지 않음
  }
  const s = series[selectedIdx];
  const [yy, mm, dd] = s.date.split('-');

  return (
    <div className="chart-selected show">
      <span className="sel-date">
        {yy}.{mm}.{dd}
      </span>
      <span className="sel-in">
        +{fmtKRW(s.in)}{' '}
        <span style={{ color: 'var(--ink-3)', fontWeight: 500, fontSize: 10 }}>
          (누적 {fmtKRWShort(s.cumIn)})
        </span>
      </span>
      <span className="sel-out">
        -{fmtKRW(s.out)}{' '}
        <span style={{ color: 'var(--ink-3)', fontWeight: 500, fontSize: 10 }}>
          (누적 {fmtKRWShort(s.cumOut)})
        </span>
      </span>
      <button
        className="sel-close"
        title="닫기"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        ×
      </button>
    </div>
  );
}

/** BalanceChart.jsx 의 buildSeries 와 동일 — 두 컴포넌트가 같은 내용을 표시한다 */
function buildSeries(records, rangeDays) {
  const byDay = {};
  records.forEach((r) => {
    if (r.kind === 'workout') return;
    if (!byDay[r.date]) byDay[r.date] = { in: 0, out: 0 };
    if (r.kind === 'income') byDay[r.date].in += r.amount;
    if (r.kind === 'expense') byDay[r.date].out += r.amount;
  });

  const days = [];
  const today = new Date();
  for (let i = rangeDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(fmtDate(d));
  }

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

  const series = [];
  let cumIn = startIn;
  let cumOut = startOut;
  days.forEach((d) => {
    const v = byDay[d] || { in: 0, out: 0 };
    cumIn += v.in;
    cumOut += v.out;
    series.push({ date: d, in: v.in, out: v.out, cumIn, cumOut });
  });
  return series;
}
