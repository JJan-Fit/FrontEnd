/**
 * 운동 카테고리 필터 칩 (가로 스크롤).
 *
 * @param {{
 *   cats: any[],
 *   selectedId: string | null,
 *   onChange: (id: string) => void,
 * }} props
 */
export default function CategoryChips({ cats, selectedId, onChange }) {
  return (
    <div className="wo-chips">
      {cats.map((c) => (
        <button
          key={c.id}
          className={`wo-chip ${selectedId === c.id ? 'active' : ''}`}
          onClick={() => onChange(c.id)}
        >
          <span className="dot" style={{ background: c.color }} />
          {c.name}
        </button>
      ))}
    </div>
  );
}
