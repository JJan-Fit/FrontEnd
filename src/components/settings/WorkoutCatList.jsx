import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { WORKOUT_PALETTE } from '../../constants/defaults.js';
import { findById } from '../../utils/id.js';
import InlineEdit from '../common/InlineEdit.jsx';

/**
 * 운동 카테고리 + 종목 관리 섹션.
 *
 * UX:
 *  - 이름 클릭 또는 ✎ 버튼 → 그 자리에서 인라인 편집
 *  - 카테고리 색상은 색상 input 으로 즉시 변경 가능
 *  - Enter 로 새 항목/카테고리 추가
 */
export default function WorkoutCatList() {
  const { state, actions } = useApp();
  const toast = useToast();

  const [exDrafts, setExDrafts] = useState({});
  const [catDraft, setCatDraft] = useState('');
  // 현재 편집 중인 항목 — 'cat:<id>' 또는 'ex:<catId>:<exId>'
  const [editingKey, setEditingKey] = useState(null);

  const setExDraft = (catId, v) => setExDrafts((m) => ({ ...m, [catId]: v }));

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
    const color = WORKOUT_PALETTE[state.workoutCats.length % WORKOUT_PALETTE.length];
    actions.addWorkoutCat(nm, color);
    setCatDraft('');
    toast('Type 추가됨');
  };

  /** 카테고리 색상 변경 — 컬러 피커에서 직접 수정 */
  const handleColorChange = (catId, color) => {
    // workoutCats 의 color 만 갱신해야 하므로 직접 setState 가 아닌 actions.* 가 필요
    // 그러나 AppContext 에는 색상 변경 전용 액션이 없어서 일반화된 액션을 추가하자
    // → renameWorkoutCat 패턴을 따르되 useApp 으로 직접 setState 노출하지 않으므로
    //   여기서는 임시로 카테고리 객체 전체를 업데이트하는 setColor 액션이 있다고 가정.
    //   AppContext 에 setWorkoutCatColor 가 추가되어 있어야 함.
    actions.setWorkoutCatColor(catId, color);
  };

  return (
    <div className="set-section">
      <div className="hdr-row">
        <h2>
          <span className="em">💪</span>운동 Type · 종목
        </h2>
      </div>

      <div className="list">
        {state.workoutCats.map((c) => {
          const editingCat = editingKey === `cat:${c.id}`;
          return (
            <div key={c.id}>
              {/* 카테고리 헤더 */}
              <div className="item">
                <label
                  className="cat-color-swatch"
                  style={{ background: c.color }}
                  title="색상 변경"
                >
                  <input
                    type="color"
                    value={c.color}
                    onChange={(e) => handleColorChange(c.id, e.target.value)}
                  />
                </label>
                <div
                  className="nm editable-nm"
                  onClick={() => !editingCat && setEditingKey(`cat:${c.id}`)}
                  title="클릭해서 이름 수정"
                >
                  <InlineEdit
                    value={c.name}
                    editing={editingCat}
                    onEditingChange={(b) => setEditingKey(b ? `cat:${c.id}` : null)}
                    onSave={(nm) => {
                      actions.renameWorkoutCat(c.id, nm);
                      toast('이름 수정됨');
                    }}
                    placeholder="카테고리 이름"
                  />
                </div>
                <div className="item-actions">
                  <button
                    className="edit"
                    title="이름 수정"
                    onClick={() =>
                      setEditingKey(editingCat ? null : `cat:${c.id}`)
                    }
                  >
                    ✎
                  </button>
                  <button
                    className="del"
                    title="삭제"
                    onClick={() => handleDeleteCat(c.id)}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* 종목 목록 */}
              {c.exercises.map((e) => {
                const editingEx = editingKey === `ex:${c.id}:${e.id}`;
                return (
                  <div className="item sub" key={e.id}>
                    <span
                      className="dot"
                      style={{
                        background: c.color,
                        opacity: 0.6,
                        width: 6,
                        height: 6,
                      }}
                    />
                    <div
                      className="nm editable-nm"
                      style={{ fontWeight: 500, fontSize: 13 }}
                      onClick={() =>
                        !editingEx && setEditingKey(`ex:${c.id}:${e.id}`)
                      }
                      title="클릭해서 이름 수정"
                    >
                      <InlineEdit
                        value={e.name}
                        editing={editingEx}
                        onEditingChange={(b) =>
                          setEditingKey(b ? `ex:${c.id}:${e.id}` : null)
                        }
                        onSave={(nm) => {
                          actions.renameExercise(c.id, e.id, nm);
                          toast('이름 수정됨');
                        }}
                        placeholder="종목 이름"
                      />
                    </div>
                    <div className="item-actions">
                      <button
                        className="edit"
                        title="이름 수정"
                        onClick={() =>
                          setEditingKey(
                            editingEx ? null : `ex:${c.id}:${e.id}`
                          )
                        }
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
                );
              })}

              {/* 종목 추가 인풋 */}
              <div className="add-row" style={{ paddingLeft: 24 }}>
                <input
                  placeholder={`${c.name}에 추가할 종목`}
                  value={exDrafts[c.id] || ''}
                  onChange={(e) => setExDraft(c.id, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddEx(c.id)}
                  maxLength={20}
                />
                <button
                  onClick={() => handleAddEx(c.id)}
                  disabled={!(exDrafts[c.id] || '').trim()}
                >
                  추가
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 카테고리 추가 인풋 */}
      <div className="add-row">
        <input
          placeholder="새 Type (어깨 · 팔 · 유산소 ...)"
          value={catDraft}
          onChange={(e) => setCatDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddCat()}
          maxLength={20}
        />
        <button onClick={handleAddCat} disabled={!catDraft.trim()}>
          추가
        </button>
      </div>
    </div>
  );
}
