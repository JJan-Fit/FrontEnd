import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { fmtTime } from '../../utils/date.js';
import { findById } from '../../utils/id.js';
import { fmtKRWShort, fromComma, toComma } from '../../utils/format.js';
import TypeChips from '../common/TypeChips.jsx';
import QuickAmount from '../common/QuickAmount.jsx';

/**
 * 수입 / 지출 추가 · 수정 모달.
 *
 * UX 디자인 원칙:
 *  - 모달이 뜨면 가장 자주 쓰는 입력(금액)에 자동 포커스 → 모바일 키보드가 즉시 떠서 타이핑 시작 가능
 *  - +1천 / +1만 / +10만 등 빠른 버튼으로 금액 누적 입력 (가계부 앱 표준)
 *  - 큰 글자로 현재 금액 미리보기 표시
 *  - 종류 선택 → 금액 입력 흐름 직관적
 *  - 어디서든 Enter 누르면 저장 (조건 충족 시)
 *
 * @param {{
 *   kind: 'income' | 'expense',
 *   defaultDate: string,
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

  // 새 항목 추가 폼 (인라인 — prompt 대신)
  const [showAddType, setShowAddType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');

  // 금액 인풋 ref — 모달 진입 시 자동 포커스
  const amountRef = useRef(null);
  useEffect(() => {
    // 모달 슬라이드 업 트랜지션과 겹치지 않게 약간 지연 후 포커스
    const t = setTimeout(() => amountRef.current?.focus(), 320);
    return () => clearTimeout(t);
  }, []);

  // 종류가 삭제되면 자동으로 선택 해제
  useEffect(() => {
    if (selectedTypeId && !types.some((t) => t.id === selectedTypeId)) {
      setSelectedTypeId(null);
    }
  }, [types, selectedTypeId]);

  const amount = fromComma(amountStr);
  const canSave = !!selectedTypeId && amount > 0;

  /* ---------- 빠른 금액 버튼 ---------- */
  const handleQuickAdd = (delta) => {
    setAmountStr(toComma(amount + delta));
  };
  const handleClearAmount = () => setAmountStr('');

  /* ---------- 종류 인라인 추가 ---------- */
  const handleOpenAddType = () => {
    setShowAddType(true);
    setNewTypeName('');
  };
  const handleConfirmAddType = () => {
    const nm = newTypeName.trim();
    if (!nm) return;
    actions.addType(typesKey, nm);
    setShowAddType(false);
    setNewTypeName('');
    toast('종류 추가됨');
  };
  const handleCancelAddType = () => {
    setShowAddType(false);
    setNewTypeName('');
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

  /** 폼 어디서든 Enter 누르면 저장 (저장 가능 상태일 때만) */
  const handleFormKeyDown = (e) => {
    if (e.key === 'Enter' && canSave && !showAddType) {
      e.preventDefault();
      handleSave();
    }
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
    <div onKeyDown={handleFormKeyDown}>
      <h3>
        <span className="em">{emoji}</span>
        {title}
      </h3>

      {/* 큰 금액 미리보기 — 입력 중인 값이 시각적으로 즉시 보이게 */}
      <div className={`amount-preview ${colorCls}`}>
        <span className="sign">{kind === 'income' ? '+' : '−'}</span>
        <span className="value">{amountStr || '0'}</span>
        <span className="unit">원</span>
        {amount > 0 && (
          <span className="hint">{fmtKRWShort(amount).replace('₩', '')}</span>
        )}
      </div>

      {/* 금액 입력 */}
      <div className="field">
        <label>금액</label>
        <input
          ref={amountRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={amountStr}
          onChange={(e) => setAmountStr(toComma(e.target.value))}
          className="amount-input"
        />
        <QuickAmount onAdd={handleQuickAdd} onClear={handleClearAmount} />
      </div>

      {/* 종류 선택 */}
      <div className="field">
        <label>
          종류{' '}
          <span style={{ fontWeight: 500, color: 'var(--ink-3)' }}>
            (길게 눌러 삭제)
          </span>
        </label>
        <TypeChips
          items={types}
          selectedId={selectedTypeId}
          onSelect={setSelectedTypeId}
          onAdd={handleOpenAddType}
          onDelete={handleDeleteType}
        />
        {showAddType && (
          <div className="inline-add">
            <input
              autoFocus
              placeholder={`새 ${kind === 'income' ? '수입' : '지출'} 종류 이름`}
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirmAddType();
                } else if (e.key === 'Escape') {
                  handleCancelAddType();
                }
              }}
              maxLength={20}
            />
            <button
              type="button"
              className="inline-add-confirm"
              onClick={handleConfirmAddType}
              disabled={!newTypeName.trim()}
            >
              추가
            </button>
            <button
              type="button"
              className="inline-add-cancel"
              onClick={handleCancelAddType}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* 날짜·시간 — 자주 변경하지 않으므로 아래쪽 */}
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
    </div>
  );
}
