import { findById } from '../../utils/id.js';
import EmptyState from '../common/EmptyState.jsx';

/**
 * 오늘의 운동 세션 리스트.
 *
 * - 시간 역순 정렬
 * - 각 세션의 세트 칩 + 편집/삭제 버튼
 *
 * @param {{
 *   sessions: any[],                    // 이미 정렬된 오늘 세션
 *   workoutCats: any[],
 *   onEdit: (record: any) => void,
 *   onDelete: (record: any) => void,
 * }} props
 */
export default function SessionList({ sessions, workoutCats, onEdit, onDelete }) {
  if (sessions.length === 0) {
    return (
      <EmptyState emoji="🌱">
        오늘 아직 운동 기록이 없어요.
        <br />위에서 운동을 선택해 시작해 보세요!
      </EmptyState>
    );
  }

  return (
    <div>
      {sessions.map((r) => {
        const c = findById(workoutCats, r.categoryId);
        const e = c?.exercises.find((x) => x.id === r.exerciseId);
        return (
          <div className="sess" key={r.id}>
            <div className="hdr">
              <div className="tt">
                <span
                  className="cat-pill"
                  style={{ background: c?.color || '#888', color: 'var(--ink)' }}
                >
                  {c?.name || '?'}
                </span>
                <span className="nm">{e?.name || '?'}</span>
              </div>
              <div className="time">{r.time || ''}</div>
            </div>

            <div className="sets">
              {(r.sets || []).map((s, i) => (
                <span className="chip" key={i}>
                  {i + 1}S · {s.w}kg × {s.r}
                </span>
              ))}
            </div>

            <div className="row-actions">
              <button className="edit" onClick={() => onEdit(r)}>
                편집
              </button>
              <button className="del" onClick={() => onDelete(r)}>
                삭제
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
