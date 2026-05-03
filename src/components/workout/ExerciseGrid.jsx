import EmptyState from '../common/EmptyState.jsx';

/**
 * 선택한 카테고리의 운동 종목 카드 그리드.
 *
 * 각 카드를 누르면 onPick(catId, exId) 가 호출되어 세션 모달이 뜬다.
 *
 * @param {{
 *   cat: any,                          // 선택된 카테고리
 *   exercises: any[],                  // (검색 적용된) 종목 배열
 *   records: any[],                    // 통계 계산용 — workout 기록만 들어있어도 무방
 *   onPick: (catId: string, exId: string) => void,
 * }} props
 */
export default function ExerciseGrid({ cat, exercises, records, onPick }) {
  if (!cat) {
    return (
      <div className="ex-grid">
        <EmptyState emoji="🏋️" style={{ gridColumn: 'span 2' }}>
          카테고리를 선택하세요
        </EmptyState>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="ex-grid">
        <EmptyState emoji="🔍" style={{ gridColumn: 'span 2', padding: 20 }}>
          검색 결과가 없어요
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="ex-grid">
      {exercises.map((e) => {
        const exRecs = records.filter((r) => r.kind === 'workout' && r.exerciseId === e.id);
        const sessCount = exRecs.length;
        const maxW = exRecs.reduce((mx, r) => {
          const m = (r.sets || []).reduce((mm, s) => Math.max(mm, Number(s.w) || 0), 0);
          return Math.max(mx, m);
        }, 0);
        return (
          <button key={e.id} className="ex-card" onClick={() => onPick(cat.id, e.id)}>
            <span className="cat" style={{ background: cat.color, color: 'var(--ink)' }}>
              {cat.name}
            </span>
            <div className="nm">{e.name}</div>
            <div className="stat">
              {sessCount}회 · 최고 {maxW}kg
            </div>
          </button>
        );
      })}
    </div>
  );
}
