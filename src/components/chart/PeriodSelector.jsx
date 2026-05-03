import { PERIOD_OPTIONS } from '../../constants/defaults.js';

/**
 * 차트 표시 기간 선택 (1주 / 1개월 / 3개월 / 1년).
 *
 * @param {{ value: number, onChange: (days: number) => void }} props
 */
export default function PeriodSelector({ value, onChange }) {
  return (
    <div className="period-row">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.days}
          className={`period-btn ${value === opt.days ? 'active' : ''}`}
          onClick={() => onChange(opt.days)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
