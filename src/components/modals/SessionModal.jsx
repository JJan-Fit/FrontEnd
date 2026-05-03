import { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { fmtTime } from '../../utils/date.js';
import { findById } from '../../utils/id.js';
import NumberStepper from '../common/NumberStepper.jsx';

/**
 * 운동 세션(여러 세트) 입력/수정 모달.
 *
 * UX 디자인:
 *  - 각 세트의 무게/횟수에 +/- 버튼이 붙은 NumberStepper 사용 → 한 손 조작 편의
 *  - 무게 칸에서 Enter → 같은 세트의 횟수 칸으로 자동 이동
 *  - 횟수 칸에서 Enter → 새 세트 추가 후 무게 칸으로 자동 이동 (반복 입력 빠름)
 *  - 마지막 세트의 무게/횟수가 다음 세트 추가 시 기본값으로 미리 채워짐
 *  - 새로 추가한 세트의 무게 인풋이 자동 포커스
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

  const existing = useMemo(
    () => (existingRecId ? findById(state.records, existingRecId) : null),
    [existingRecId, state.records]
  );

  const [date, setDate] = useState(existing?.date || defaultDate);
  const [time, setTime] = useState(existing?.time || fmtTime(new Date()));
  const [sets, setSets] = useState(
    existing?.sets ? JSON.parse(JSON.stringify(existing.sets)) : [{ w: '', r: '' }]
  );

  // 각 입력 칸의 ref — Enter 로 다음 칸으로 점프할 때 사용
  // 구조: refs.current[setIdx] = { w, r }
  const refs = useRef([]);
  // 새 세트가 추가됐을 때 그 세트의 w 인풋으로 포커스 이동
  const focusTargetRef = useRef(null);

  useEffect(() => {
    if (!cat || !ex) {
      toast('카테고리/운동을 찾을 수 없습니다');
      closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, ex]);

  // 새 세트 추가 후 그 세트로 자동 포커스
  useEffect(() => {
    if (focusTargetRef.current != null) {
      const i = focusTargetRef.current;
      focusTargetRef.current = null;
      requestAnimationFrame(() => {
        refs.current[i]?.w?.focus();
      });
    }
  }, [sets.length]);

  // 모달이 처음 열렸을 때 첫 빈 세트의 무게에 포커스 (수정 모드는 패스)
  useEffect(() => {
    if (existingRecId) return;
    const t = setTimeout(() => refs.current[0]?.w?.focus(), 320);
    return () => clearTimeout(t);
  }, [existingRecId]);

  if (!cat || !ex) return null;

  /* ---------- 세트 조작 ---------- */
  const updateSet = (i, key, value) => {
    setSets((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));
  };

  const addSet = (autoFocus = true) => {
    setSets((prev) => {
      const last = prev[prev.length - 1];
      const next = [...prev, { w: last?.w || '', r: last?.r || '' }];
      if (autoFocus) focusTargetRef.current = next.length - 1;
      return next;
    });
  };

  const removeSet = (i) => {
    setSets((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      return next.length === 0 ? [{ w: '', r: '' }] : next;
    });
  };

  /* ---------- Enter 키 처리 ---------- */
  // 무게(w) Enter → 같은 세트 횟수(r) 칸으로
  const handleWeightEnter = (i) => {
    refs.current[i]?.r?.focus();
  };

  // 횟수(r) Enter → 다음 세트가 있으면 그 세트의 w 로, 없으면 새 세트 추가 + 포커스
  const handleRepEnter = (i) => {
    if (i < sets.length - 1) {
      refs.current[i + 1]?.w?.focus();
    } else {
      // 마지막 칸이면 — 값이 들어 있을 때만 새 세트 추가 (둘 다 비어있으면 저장 의도일 수 있음)
      const cur = sets[i];
      if (Number(cur.w) > 0 && Number(cur.r) > 0) {
        addSet(true);
      } else {
        // 모두 비어 있으면 저장 시도
        handleSave();
      }
    }
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

  // 합계 — 사용자가 진행 상황을 한눈에 볼 수 있도록 표시
  const totalVolume = sets.reduce(
    (acc, s) => acc + (Number(s.w) || 0) * (Number(s.r) || 0),
    0
  );
  const validCount = sets.filter((s) => Number(s.w) > 0 && Number(s.r) > 0).length;

  return (
    <>
      <h3>
        <span className="cat-pill" style={{ background: cat.color, color: 'var(--ink)' }}>
          {cat.name}
        </span>
        <span style={{ fontFamily: "'Gaegu',cursive", fontSize: 22 }}>{ex.name}</span>
      </h3>

      {/* 진행 상황 미리보기 */}
      <div className="session-summary">
        <div>
          <div className="lbl">유효 세트</div>
          <div className="val">
            {validCount}
            <span className="unit"> / {sets.length}</span>
          </div>
        </div>
        <div>
          <div className="lbl">총 볼륨</div>
          <div className="val">
            {totalVolume.toLocaleString()}
            <span className="unit"> kg·rep</span>
          </div>
        </div>
      </div>

      {/* 세트 헤더 */}
      <div className="set-hdr">
        <span>세트</span>
        <span>무게 (kg)</span>
        <span>횟수</span>
        <span />
      </div>

      <div>
        {sets.map((s, i) => {
          // 각 세트 ref 슬롯 보장
          if (!refs.current[i]) refs.current[i] = { w: null, r: null };
          return (
            <div className="set-row stepper-row" key={i}>
              <div className="sn">{i + 1}SET</div>
              <NumberStepper
                ref={(el) => {
                  if (refs.current[i]) refs.current[i].w = el;
                }}
                value={s.w}
                onChange={(v) => updateSet(i, 'w', v)}
                step={2.5}
                min={0}
                inputMode="decimal"
                ariaLabel={`${i + 1}세트 무게`}
                onEnter={() => handleWeightEnter(i)}
              />
              <NumberStepper
                ref={(el) => {
                  if (refs.current[i]) refs.current[i].r = el;
                }}
                value={s.r}
                onChange={(v) => updateSet(i, 'r', v)}
                step={1}
                min={0}
                inputMode="numeric"
                ariaLabel={`${i + 1}세트 횟수`}
                onEnter={() => handleRepEnter(i)}
              />
              <button
                type="button"
                className="x"
                onClick={() => removeSet(i)}
                title="이 세트 삭제"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <button type="button" className="add-set" onClick={() => addSet(true)}>
        + 세트 추가
      </button>

      {/* 날짜/시간은 보조 정보라 아래로 */}
      <div className="field row" style={{ marginTop: 14 }}>
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
