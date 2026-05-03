import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { WORKOUT_PALETTE } from '../../constants/defaults.js';

/**
 * 운동 카테고리 필터 칩 (가로 스크롤).
 *
 * 마지막에 "+ Type" 칩이 있어 클릭 시 인라인 입력 폼이 열린다.
 * 추가 완료 시 새 카테고리로 자동 선택된다.
 *
 * @param {{
 *   cats: any[],
 *   selectedId: string | null,
 *   onChange: (id: string) => void,
 * }} props
 */
export default function CategoryChips({ cats, selectedId, onChange }) {
  const { actions } = useApp();
  const toast = useToast();

  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const handleConfirmAdd = () => {
    const nm = draft.trim();
    if (!nm) return;
    // 팔레트에서 색상 자동 배정 — 같은 색이 연속으로 나오지 않게 인덱스 기반
    const color = WORKOUT_PALETTE[cats.length % WORKOUT_PALETTE.length];
    const newId = actions.addWorkoutCat(nm, color);
    toast(`"${nm}" 추가됨`);
    setAdding(false);
    setDraft('');
    if (newId) onChange(newId); // 추가하자마자 그 카테고리 선택
  };

  const handleCancelAdd = () => {
    setAdding(false);
    setDraft('');
  };

  return (
    <div className="wo-chips-wrap">
      <div className="wo-chips">
        {cats.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`wo-chip ${selectedId === c.id ? 'active' : ''}`}
            onClick={() => onChange(c.id)}
          >
            <span className="dot" style={{ background: c.color }} />
            {c.name}
          </button>
        ))}

        {/* + Type 추가 칩 — 카테고리 만들기 진입 */}
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
