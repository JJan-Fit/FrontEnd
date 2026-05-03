import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { findById } from '../../utils/id.js';
import InlineEdit from '../common/InlineEdit.jsx';

/**
 * 수입/지출 종류를 관리하는 리스트 섹션.
 *
 * UX:
 *  - ✎ 버튼 또는 이름 클릭 → 그 자리에서 인라인 편집 (prompt 사용 X)
 *  - Enter 로 저장, Esc 로 취소, 포커스 잃어도 자동 저장
 *  - Enter 로 새 항목 추가
 *
 * @param {{
 *   storeKey: 'incomeTypes' | 'expenseTypes',
 *   title: string,
 *   emoji: string,
 *   dotColor: string,
 *   placeholder: string,
 * }} props
 */
export default function TypeListSection({ storeKey, title, emoji, dotColor, placeholder }) {
  const { state, actions } = useApp();
  const toast = useToast();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState(null); // 현재 편집 중인 항목 id

  const items = state[storeKey];

  const handleAdd = () => {
    const nm = draft.trim();
    if (!nm) return;
    actions.addType(storeKey, nm);
    setDraft('');
    toast('추가됨');
  };

  const handleRename = (id, nextName) => {
    actions.renameType(storeKey, id, nextName);
    toast('이름 수정됨');
  };

  const handleDelete = (id) => {
    if (!confirm('삭제하시겠어요?')) return;
    actions.deleteType(storeKey, id);
  };

  return (
    <div className="set-section">
      <div className="hdr-row">
        <h2>
          <span className="em">{emoji}</span>
          {title}
        </h2>
      </div>

      <div className="list">
        {items.map((t) => {
          const isEditing = editingId === t.id;
          return (
            <div className="item" key={t.id}>
              <span className="dot" style={{ background: dotColor }} />
              <div
                className="nm editable-nm"
                onClick={() => !isEditing && setEditingId(t.id)}
                title="클릭해서 이름 수정"
              >
                {findById(items, t.id) && (
                  <InlineEdit
                    value={t.name}
                    editing={isEditing}
                    onEditingChange={(b) => setEditingId(b ? t.id : null)}
                    onSave={(nm) => handleRename(t.id, nm)}
                    placeholder="이름 입력"
                  />
                )}
              </div>
              <div className="item-actions">
                <button
                  className="edit"
                  title="이름 수정"
                  onClick={() => setEditingId(isEditing ? null : t.id)}
                >
                  ✎
                </button>
                <button className="del" title="삭제" onClick={() => handleDelete(t.id)}>
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="add-row">
        <input
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          maxLength={20}
        />
        <button onClick={handleAdd} disabled={!draft.trim()}>
          추가
        </button>
      </div>
    </div>
  );
}
