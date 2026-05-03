/**
 * 달력 모드 전환 — 머니(수입/지출) 또는 운동.
 *
 * @param {{ mode: 'money' | 'workout', onChange: (mode: 'money' | 'workout') => void }} props
 */
export default function CalendarModeSwitch({ mode, onChange }) {
  return (
    <div className="cal-mode">
      <button
        className={`cal-mode-btn money ${mode === 'money' ? 'active' : ''}`}
        onClick={() => onChange('money')}
      >
        💰 수입/지출
      </button>
      <button
        className={`cal-mode-btn workout ${mode === 'workout' ? 'active' : ''}`}
        onClick={() => onChange('workout')}
      >
        💪 운동
      </button>
    </div>
  );
}
