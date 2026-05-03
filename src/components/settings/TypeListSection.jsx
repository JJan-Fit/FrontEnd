import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { findById } from '../../utils/id.js';

/**
 * 수입/지출 종류를 관리하는 리스트 섹션.
 *
 * - 항목 좌측 점은 수입/지출 색상 (settings 색상)
 * - 이름 수정 / 삭제 / 새 항목 추가
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

  const items = state[storeKey];

  const handleAdd = () => {
    const nm = draft.trim();
    if (!nm) return;
    actions.addType(storeKey, nm);
    setDraft('');
    toast('추가됨');
  };

  const handleRename = (id) => {
    const t = findById(items, id);
    if (!t) return;
    const nm = prompt('새 이름', t.name);
    if (nm && nm.trim()) {
      actions.renameType(storeKey, id, nm.trim());
      toast('이름 수정됨');
    }
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
        {items.map((t) => (
          <div className="item" key={t.id}>
            <span className="dot" style={{ background: dotColor }} />
            <div className="nm">{t.name}</div>
            <div className="item-actions">
              <button className="edit" title="이름 수정" onClick={() => handleRename(t.id)}>
                ✎
              </button>
              <button className="del" title="삭제" onClick={() => handleDelete(t.id)}>
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="add-row">
        <input
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd}>추가</button>
      </div>
    </div>
  );
}
