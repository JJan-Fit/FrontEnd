import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { WORKOUT_PALETTE } from '../../constants/defaults.js';
import { findById } from '../../utils/id.js';

/**
 * 운동 카테고리 + 종목 관리 섹션.
 *
 * 트리 구조:
 *   카테고리 (이름·색상·삭제·이름수정)
 *     ㄴ 종목 (이름수정·삭제)
 *     ㄴ 새 종목 추가 인풋
 *   새 카테고리 추가 인풋
 */
export default function WorkoutCatList() {
  const { state, actions } = useApp();
  const toast = useToast();

  // 카테고리별 새 종목 입력 — { [catId]: 'string' }
  const [exDrafts, setExDrafts] = useState({});
  const [catDraft, setCatDraft] = useState('');

  const setExDraft = (catId, v) => setExDrafts((m) => ({ ...m, [catId]: v }));

  const handleRenameCat = (catId) => {
    const c = findById(state.workoutCats, catId);
    if (!c) return;
    const nm = prompt('새 이름', c.name);
    if (nm && nm.trim()) {
      actions.renameWorkoutCat(catId, nm.trim());
      toast('이름 수정됨');
    }
  };

  const handleDeleteCat = (catId) => {
    const c = findById(state.workoutCats, catId);
    if (!c) return;
    if (
      !confirm(
        `"${c.name}" 카테고리와 하위 종목을 모두 삭제할까요?\n(기존 기록은 유지됩니다)`
      )
    )
      return;
    actions.deleteWorkoutCat(catId);
  };

  const handleRenameEx = (catId, exId) => {
    const c = findById(state.workoutCats, catId);
    const e = c?.exercises.find((x) => x.id === exId);
    if (!e) return;
    const nm = prompt('새 이름', e.name);
    if (nm && nm.trim()) {
      actions.renameExercise(catId, exId, nm.trim());
      toast('이름 수정됨');
    }
  };

  const handleDeleteEx = (catId, exId) => {
    if (!confirm('종목을 삭제할까요?')) return;
    actions.deleteExercise(catId, exId);
  };

  const handleAddEx = (catId) => {
    const nm = (exDrafts[catId] || '').trim();
    if (!nm) return;
    actions.addExercise(catId, nm);
    setExDraft(catId, '');
    toast('추가됨');
  };

  const handleAddCat = () => {
    const nm = catDraft.trim();
    if (!nm) return;
    // 새 카테고리는 팔레트에서 차례로 색상 배정 (기존 개수 % 팔레트 길이)
    const color = WORKOUT_PALETTE[state.workoutCats.length % WORKOUT_PALETTE.length];
    actions.addWorkoutCat(nm, color);
    setCatDraft('');
    toast('Type 추가됨');
  };

  return (
    <div className="set-section">
      <div className="hdr-row">
        <h2>
          <span className="em">💪</span>운동 Type · 종목
        </h2>
      </div>

      <div className="list">
        {state.workoutCats.map((c) => (
          <div key={c.id}>
            {/* 카테고리 헤더 */}
            <div className="item">
              <span className="dot" style={{ background: c.color }} />
              <div className="nm">{c.name}</div>
              <div className="item-actions">
                <button className="edit" title="이름 수정" onClick={() => handleRenameCat(c.id)}>
                  ✎
                </button>
                <button className="del" title="삭제" onClick={() => handleDeleteCat(c.id)}>
                  ×
                </button>
              </div>
            </div>

            {/* 종목 목록 */}
            {c.exercises.map((e) => (
              <div className="item sub" key={e.id}>
                <span
                  className="dot"
                  style={{ background: c.color, opacity: 0.6, width: 6, height: 6 }}
                />
                <div className="nm" style={{ fontWeight: 500, fontSize: 13 }}>
                  {e.name}
                </div>
                <div className="item-actions">
                  <button
                    className="edit"
                    title="이름 수정"
                    onClick={() => handleRenameEx(c.id, e.id)}
                  >
                    ✎
                  </button>
                  <button
                    className="del"
                    title="삭제"
                    onClick={() => handleDeleteEx(c.id, e.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {/* 종목 추가 인풋 */}
            <div className="add-row" style={{ paddingLeft: 24 }}>
              <input
                placeholder={`${c.name}에 추가할 종목`}
                value={exDrafts[c.id] || ''}
                onChange={(e) => setExDraft(c.id, e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddEx(c.id)}
              />
              <button onClick={() => handleAddEx(c.id)}>추가</button>
            </div>
          </div>
        ))}
      </div>

      {/* 카테고리 추가 인풋 */}
      <div className="add-row">
        <input
          placeholder="새 Type (어깨 · 팔 · 유산소 ...)"
          value={catDraft}
          onChange={(e) => setCatDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
        />
        <button onClick={handleAddCat}>추가</button>
      </div>
    </div>
  );
}
