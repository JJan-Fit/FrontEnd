import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { WORKOUT_PALETTE } from '../../constants/defaults.js';
import { findById } from '../../utils/id.js';

/**
 * 운동 카테고리 필터 칩 (가로 스크롤).
 *
 *  - 칩을 클릭하면 그 카테고리로 필터링.
 *  - 활성 칩(현재 선택된 카테고리) 안에는 작은 ✕ 버튼이 보여 즉석에서 삭제 가능.
 *    "이미 보고 있는 카테고리"에만 노출되므로 실수로 누를 위험이 적다.
 *  - 마지막에 점선 "+ Type" 칩이 있고, 클릭 시 인라인 입력 폼이 열린다.
 *    추가 직후 새 카테고리가 자동 선택된다.
 *
 * @param {{
 *   cats: any[],
 *   selectedId: string | null,
 *   onChange: (id: string) => void,
 * }} props
 */
export default function CategoryChips({ cats, selectedId, onChange }) {
  const { state, actions } = useApp();
  const toast = useToast();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  /* ---------- 추가 ---------- */
  const handleConfirmAdd = () => {
    const nm = draft.trim();
    if (!nm) return;
    const color = WORKOUT_PALETTE[cats.length % WORKOUT_PALETTE.length];
    const newId = actions.addWorkoutCat(nm, color);
    toast(`"${nm}" 추가됨`);
    setAdding(false);
    setDraft('');
    if (newId) onChange(newId);
  };

  const handleCancelAdd = () => {
    setAdding(false);
    setDraft('');
  };

  /* ---------- 삭제 ---------- */
  const handleDelete = (catId, e) => {
    e.stopPropagation(); // 부모 칩의 onClick(=재선택) 막기
    const c = findById(cats, catId);
    if (!c) return;

    // 이 카테고리로 기록된 운동 세션이 몇 개인지 미리 알려줌 — 사용자가 경각심 갖도록
    const sessionCount = state.records.filter(
      (r) => r.kind === 'workout' && r.categoryId === catId
    ).length;

    const lines = [`"${c.name}" 카테고리와 하위 종목 ${c.exercises.length}개를 삭제할까요?`];
    if (sessionCount > 0) {
      lines.push(`기존 운동 기록 ${sessionCount}개는 그대로 남습니다 (이름 표시만 빠짐).`);
    }
    if (!confirm(lines.join('\n'))) return;

    actions.deleteWorkoutCat(catId);
    toast('카테고리 삭제됨');

    // 삭제된 카테고리가 현재 선택이었다면 다음 카테고리로 자동 이동
    if (selectedId === catId) {
      const remaining = cats.filter((x) => x.id !== catId);
      onChange(remaining[0]?.id || null);
    }
  };

  return (
    <div className="wo-chips-wrap">
      <div className="wo-chips">
        {cats.map((c) => {
          const isActive = selectedId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              className={`wo-chip ${isActive ? 'active' : ''}`}
              onClick={() => onChange(c.id)}
            >
              <span className="dot" style={{ background: c.color }} />
              {c.name}
              {/* 활성 칩에만 ✕ 버튼 노출 — 실수 클릭 위험 최소화 */}
              {isActive && (
                <span
                  role="button"
                  tabIndex={0}
                  className="wo-chip-del"
                  aria-label={`${c.name} 카테고리 삭제`}
                  title="이 Type 삭제"
                  onClick={(e) => handleDelete(c.id, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDelete(c.id, e);
                    }
                  }}
                >
                  ×
                </span>
              )}
            </button>
          );
        })}

        {/* + Type 추가 칩 */}
        <button
          type="button"
          className="wo-chip add"
          onClick={() => {
            setAdding(true);
            setDraft('');
          }}
          aria-label="새 Type 추가"
        >
          ＋ Type
        </button>
      </div>

      {/* 인라인 카테고리 추가 폼 */}
      {adding && (
        <div className="inline-add" style={{ marginTop: 8 }}>
          <input
            autoFocus
            placeholder="새 Type 이름 (예: 어깨, 하체, 팔, 유산소)"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmAdd();
              } else if (e.key === 'Escape') {
                handleCancelAdd();
              }
            }}
            maxLength={20}
          />
          <button
            type="button"
            className="inline-add-confirm"
            onClick={handleConfirmAdd}
            disabled={!draft.trim()}
          >
            추가
          </button>
          <button
            type="button"
            className="inline-add-cancel"
            onClick={handleCancelAdd}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
