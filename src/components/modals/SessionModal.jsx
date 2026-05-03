import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { fmtTime } from '../../utils/date.js';
import { findById } from '../../utils/id.js';

/**
 * 운동 세션(여러 세트) 입력/수정 모달.
 *
 * - catId / exId 로 카테고리·종목을 식별
 * - existingRecId 가 있으면 수정 모드 (sets 가 미리 채워짐)
 * - 빈 세트(무게=0 또는 횟수=0)는 저장 시 제외, 모두 비어있으면 저장 불가
 *
 * @param {{
 *   catId: string,
 *   exId: string,
 *   defaultDate: string,
 *   existingRecId?: string | null,
 * }} props
 */
export default function SessionModal({ catId, exId, defaultDate, existingRecId = null }) {
  const { state, actions } = useApp();
  const toast = useToast();
  const { closeModal } = useModal();

  const cat = findById(state.workoutCats, catId);
  const ex = cat?.exercises.find((e) => e.id === exId);

  // 기존 기록이 있으면 폼 초기값으로 사용
  const existing = useMemo(
    () => (existingRecId ? findById(state.records, existingRecId) : null),
    [existingRecId, state.records]
  );

  const [date, setDate] = useState(existing?.date || defaultDate);
  const [time, setTime] = useState(existing?.time || fmtTime(new Date()));
  const [sets, setSets] = useState(
    existing?.sets ? JSON.parse(JSON.stringify(existing.sets)) : [{ w: '', r: '' }]
  );

  // 카테고리/종목이 사라진 경우 (드물지만 설정 화면에서 삭제했을 때)
  // 렌더 도중 setState 를 부르면 React 가 경고하므로 effect 로 미룬다
  useEffect(() => {
    if (!cat || !ex) {
      toast('카테고리/운동을 찾을 수 없습니다');
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, ex]);

  if (!cat || !ex) return null;

  /* ---------- 세트 행 조작 ---------- */
  const updateSet = (i, key, value) => {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  };

  const addSet = () => {
    setSets((prev) => {
      const last = prev[prev.length - 1];
      // 직전 세트의 무게/횟수를 기본값으로 미리 채워줌 (편의성)
      return [...prev, { w: last?.w || '', r: last?.r || '' }];
    });
  };

  const removeSet = (i) => {
    setSets((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      // 모두 지우면 빈 행 1개를 남겨 폼이 비어 보이지 않게
      return next.length === 0 ? [{ w: '', r: '' }] : next;
    });
  };

  /* ---------- 저장 ---------- */
  const handleSave = () => {
    const validSets = sets
      .map((s) => ({ w: Number(s.w) || 0, r: Number(s.r) || 0 }))
      .filter((s) => s.w > 0 && s.r > 0);

    if (validSets.length === 0) {
      toast('세트를 최소 1개 입력해 주세요');
      return;
    }

    if (existingRecId) {
      actions.updateRecord(existingRecId, { date, time, sets: validSets });
    } else {
      actions.addRecord({
        kind: 'workout',
        date,
        time,
        categoryId: catId,
        exerciseId: exId,
        sets: validSets,
      });
    }
    toast('운동 기록 완료 💪');
    closeModal();
  };

  return (
    <>
      <h3>
        <span className="cat-pill" style={{ background: cat.color, color: 'var(--ink)' }}>
          {cat.name}
        </span>
        <span style={{ fontFamily: "'Gaegu',cursive", fontSize: 22 }}>{ex.name}</span>
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

      <div className="set-hdr">
        <span>세트</span>
        <span>무게 (kg)</span>
        <span>횟수</span>
        <span />
      </div>

      <div>
        {sets.map((s, i) => (
          <div className="set-row" key={i}>
            <div className="sn">{i + 1}SET</div>
            <input
              type="number"
              step="0.5"
              inputMode="decimal"
              placeholder="0"
              value={s.w}
              onChange={(e) => updateSet(i, 'w', e.target.value)}
            />
            <input
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={s.r}
              onChange={(e) => updateSet(i, 'r', e.target.value)}
            />
            <button className="x" onClick={() => removeSet(i)} title="이 세트 삭제">
              ×
            </button>
          </div>
        ))}
      </div>

      <button className="add-set" onClick={addSet}>
        + 세트 추가
      </button>

      <button
        className="primary-btn"
        style={{ marginTop: 16, background: cat.color, color: 'var(--ink)' }}
        onClick={handleSave}
      >
        {existingRecId ? '수정하기' : '저장하기'}
      </button>
      <button className="secondary-btn" onClick={closeModal}>
        취소
      </button>
    </>
  );
}
