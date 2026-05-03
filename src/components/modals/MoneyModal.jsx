import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { fmtTime } from '../../utils/date.js';
import { findById } from '../../utils/id.js';
import { fromComma, toComma } from '../../utils/format.js';
import TypeChips from '../common/TypeChips.jsx';

/**
 * 수입 / 지출 추가 · 수정 모달.
 *
 * - kind 가 'income' 이면 incomeTypes 를, 'expense' 면 expenseTypes 를 사용한다.
 * - existingId 가 있으면 수정 모드 — 기존 기록을 폼에 채워서 시작.
 *
 * @param {{
 *   kind: 'income' | 'expense',
 *   defaultDate: string,            // selectedDate 등
 *   existingId?: string | null,
 * }} props
 */
export default function MoneyModal({ kind, defaultDate, existingId = null }) {
  const { state, actions } = useApp();
  const toast = useToast();
  const { closeModal } = useModal();

  const isEdit = !!existingId;
  const typesKey = kind === 'income' ? 'incomeTypes' : 'expenseTypes';
  const types = state[typesKey];

  // 수정 시 기존 기록 추출 (한 번만)
  const existing = useMemo(
    () => (existingId ? findById(state.records, existingId) : null),
    [existingId, state.records]
  );

  // 폼 상태
  const [date, setDate] = useState(existing?.date || defaultDate);
  const [time, setTime] = useState(existing?.time || fmtTime(new Date()));
  const [selectedTypeId, setSelectedTypeId] = useState(existing?.typeId || null);
  const [amountStr, setAmountStr] = useState(
    existing?.amount ? Number(existing.amount).toLocaleString('ko-KR') : ''
  );

  // 종류가 삭제되어 selectedTypeId 가 더이상 유효하지 않으면 자동 해제
  useEffect(() => {
    if (selectedTypeId && !types.some((t) => t.id === selectedTypeId)) {
      setSelectedTypeId(null);
    }
  }, [types, selectedTypeId]);

  const amount = fromComma(amountStr);
  const canSave = !!selectedTypeId && amount > 0;

  /* ---------- 종류 추가/삭제 (모달 안에서) ---------- */
  const handleAddType = () => {
    const nm = prompt(`${kind === 'income' ? '수입' : '지출'} 종류 이름을 입력하세요`);
    if (nm && nm.trim()) {
      actions.addType(typesKey, nm.trim());
      toast('종류 추가됨');
    }
  };

  const handleDeleteType = (id) => {
    const t = findById(types, id);
    if (!t) return;
    if (confirm(`"${t.name}" 종류를 삭제할까요?\n(기존 기록은 유지되지만 이름이 빠집니다)`)) {
      actions.deleteType(typesKey, id);
      if (selectedTypeId === id) setSelectedTypeId(null);
      toast('삭제됨');
    }
  };

  /* ---------- 저장 ---------- */
  const handleSave = () => {
    if (!canSave) return;
    if (isEdit) {
      actions.updateRecord(existingId, { date, time, typeId: selectedTypeId, amount });
      toast('수정 완료');
    } else {
      actions.addRecord({ kind, date, time, typeId: selectedTypeId, amount });
      toast(`${kind === 'income' ? '수입' : '지출'} 기록 완료!`);
    }
    closeModal();
  };

  const emoji = kind === 'income' ? '💰' : '💳';
  const colorCls = kind === 'income' ? 'in' : 'out';
  const title = isEdit
    ? kind === 'income'
      ? '수입 수정'
      : '지출 수정'
    : kind === 'income'
    ? '수입 추가'
    : '지출 추가';

  return (
    <>
      <h3>
        <span className="em">{emoji}</span>
        {title}
      </h3>

      <div className="field row">
        <div className="col">
          <label>날짜</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="col">
          <label>시간</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label>
          종류{' '}
          <span style={{ fontWeight: 500, color: 'var(--ink-3)' }}>(길게 눌러 삭제)</span>
        </label>
        <TypeChips
          items={types}
          selectedId={selectedTypeId}
          onSelect={setSelectedTypeId}
          onAdd={handleAddType}
          onDelete={handleDeleteType}
        />
      </div>

      <div className="field">
        <label>금액 (원)</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={amountStr}
          onChange={(e) => setAmountStr(toComma(e.target.value))}
        />
      </div>

      <button
        className={`primary-btn ${colorCls}`}
        disabled={!canSave}
        onClick={handleSave}
      >
        {isEdit ? '수정하기' : '저장하기'}
      </button>
      <button className="secondary-btn" onClick={closeModal}>
        취소
      </button>
    </>
  );
}
