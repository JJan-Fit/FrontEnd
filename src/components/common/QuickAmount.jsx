/**
 * 자주 쓰는 금액을 한 번에 더할 수 있는 빠른 버튼들.
 *
 * 가계부 앱에서 거의 표준 — 입력창에 직접 타이핑하는 시간을 줄여준다.
 *
 * @param {{
 *   onAdd: (delta: number) => void,
 *   onClear: () => void,
 *   presets?: number[],            // 기본 [1000, 5000, 10000, 50000, 100000]
 * }} props
 */
// 큰 금액이 왼쪽에 오도록 내림차순 정렬 — 자주 누르는 큰 단위가 엄지에 가장 가깝게
const DEFAULT_PRESETS = [100000, 50000, 10000, 5000, 1000];

export default function QuickAmount({ onAdd, onClear, presets = DEFAULT_PRESETS }) {
  return (
    <div className="quick-amount">
      {presets.map((v) => (
        <button
          type="button"
          key={v}
          className="quick-chip"
          onClick={() => onAdd(v)}
        >
          +{labelFor(v)}
        </button>
      ))}
      <button type="button" className="quick-chip clear" onClick={onClear}>
        지우기
      </button>
    </div>
  );
}

/** 1000 → '천', 10000 → '만', 100000 → '10만' */
function labelFor(v) {
  if (v >= 10_000) {
    const man = v / 10_000;
    return Number.isInteger(man) ? `${man}만` : `${man.toFixed(1)}만`;
  }
  if (v >= 1000) return `${v / 1000}천`;
  return v.toLocaleString();
}
