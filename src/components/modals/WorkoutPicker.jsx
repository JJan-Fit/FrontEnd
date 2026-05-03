import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { WORKOUT_PALETTE } from '../../constants/defaults.js';
import { findById } from '../../utils/id.js';
import SearchInput from '../common/SearchInput.jsx';
import EmptyState from '../common/EmptyState.jsx';
import SessionModal from './SessionModal.jsx';

/**
 * 운동 시작 모달 — 2단계 네비게이션.
 *
 *  Step 1) 카테고리 선택 (가슴 / 등 / 어깨 / 하체 ...)
 *      ㄴ 카테고리가 없거나 새로 만들고 싶으면 "+ 새 Type" 카드로 즉석 추가
 *
 *  Step 2) 선택한 카테고리의 세부 운동 선택
 *      ㄴ 검색창으로 그 카테고리 안에서만 필터
 *      ㄴ 종목이 없거나 못 찾으면 "+ 새 종목" 또는 "'검색어'(으)로 추가" 로 즉석 추가
 *      ㄴ ← 뒤로 버튼으로 카테고리 단계로 복귀
 *
 * 모든 추가 작업은 모달을 떠나지 않고 인라인으로 끝나므로,
 * "기록 시작 → 종목이 없네 → 설정으로 이동 → 추가 → 다시 돌아옴" 같은 끊김이 없다.
 *
 * @param {{ defaultDate: string }} props
 */
export default function WorkoutPicker({ defaultDate }) {
  const { state, actions } = useApp();
  const { openModal, closeModal } = useModal();
  const toast = useToast();

  // 단계 / 선택 / 검색 상태
  const [step, setStep] = useState('category'); // 'category' | 'exercise'
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [query, setQuery] = useState('');

  // 인라인 추가 폼 토글
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showAddEx, setShowAddEx] = useState(false);
  const [newExName, setNewExName] = useState('');

  const [yy, mm, dd] = defaultDate.split('-');

  /* ---------- 카테고리 ---------- */
  const goToCategory = () => {
    setStep('category');
    setQuery('');
    setShowAddEx(false);
    setNewExName('');
  };

  const enterCategory = (catId) => {
    setSelectedCatId(catId);
    setStep('exercise');
    setQuery('');
    setShowAddEx(false);
    setNewExName('');
  };

  const handleAddCategory = () => {
    const nm = newCatName.trim();
    if (!nm) return;
    // 새 카테고리 색상은 팔레트에서 차례로 (현재 카테고리 개수에 따라)
    const color = WORKOUT_PALETTE[state.workoutCats.length % WORKOUT_PALETTE.length];
    actions.addWorkoutCat(nm, color);
    toast(`"${nm}" 추가됨`);
    setShowAddCat(false);
    setNewCatName('');
    // 새로 만든 카테고리를 바로 선택 단계로 — id 는 actions 안에서 만들어지지만
    // workoutCats 의 마지막에 추가되므로 length-1 위치로 찾는 대신
    // 한 틱 뒤에 그 카테고리 id 를 알아내기 위해 effect 대신 여기서는
    // "추가만" 하고 사용자에게 직접 카드를 누르게 한다.
    // (검색·확인 단계가 한번 더 들어가는 게 오히려 자연스러움)
  };

  /* ---------- 운동(종목) ---------- */
  const cat = findById(state.workoutCats, selectedCatId);

  const ql = query.trim().toLowerCase();
  const filteredExs = cat
    ? ql
      ? cat.exercises.filter((e) => e.name.toLowerCase().includes(ql))
      : cat.exercises
    : [];

  const pickExercise = (exId) => {
    const id = exId;
    closeModal();
    // 닫힘 트랜지션 직후 SessionModal 열기
    setTimeout(() => {
      openModal(<SessionModal catId={cat.id} exId={id} defaultDate={defaultDate} />);
    }, 240);
  };

  const handleAddExercise = (forcedName) => {
    const nm = (forcedName ?? newExName).trim();
    if (!nm || !cat) return;
    actions.addExercise(cat.id, nm);
    toast(`"${nm}" 추가됨`);
    setShowAddEx(false);
    setNewExName('');
    setQuery(''); // 추가했으니 검색어 초기화 → 새로 추가된 종목이 잘 보임
  };

  /* =================================================================
     Step 1) 카테고리 선택
  ================================================================= */
  if (step === 'category') {
    return (
      <>
        <h3>
          <span className="em">💪</span>
          운동 시작 ·{' '}
          <span
            style={{
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 14,
              color: 'var(--ink-3)',
            }}
          >
            {yy}.{mm}.{dd}
          </span>
        </h3>

        <div
          className="picker-step-label"
          style={{ marginBottom: 10, color: 'var(--ink-2)' }}
        >
          1단계 · 부위(Type) 를 골라주세요
        </div>

        <div className="cat-grid">
          {state.workoutCats.map((c) => (
            <button
              key={c.id}
              type="button"
              className="cat-card"
              onClick={() => enterCategory(c.id)}
              style={{ '--cat-color': c.color }}
            >
              <span className="cat-color-bar" />
              <span className="cat-emoji">💪</span>
              <span className="cat-name">{c.name}</span>
              <span className="cat-meta">{c.exercises.length}개 종목</span>
            </button>
          ))}

          {/* 새 Type 추가 카드 */}
          {!showAddCat && (
            <button
              type="button"
              className="cat-card add"
              onClick={() => {
                setShowAddCat(true);
                setNewCatName('');
              }}
            >
              <span className="cat-emoji" style={{ fontSize: 26 }}>
                ＋
              </span>
              <span className="cat-name">새 Type 추가</span>
              <span className="cat-meta">예: 어깨 · 팔 · 유산소</span>
            </button>
          )}
        </div>

        {/* 새 Type 인라인 추가 폼 */}
        {showAddCat && (
          <div className="inline-add" style={{ marginTop: 12 }}>
            <input
              autoFocus
              placeholder="새 Type 이름 (예: 어깨, 하체, 팔)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCategory();
                } else if (e.key === 'Escape') {
                  setShowAddCat(false);
                  setNewCatName('');
                }
              }}
              maxLength={20}
            />
            <button
              type="button"
              className="inline-add-confirm"
              onClick={handleAddCategory}
              disabled={!newCatName.trim()}
            >
              추가
            </button>
            <button
              type="button"
              className="inline-add-cancel"
              onClick={() => {
                setShowAddCat(false);
                setNewCatName('');
              }}
            >
              ×
            </button>
          </div>
        )}

        {state.workoutCats.length === 0 && !showAddCat && (
          <EmptyState emoji="🌱" style={{ padding: '24px 10px' }}>
            아직 운동 카테고리가 없어요.
            <br />
            위 <strong>＋ 새 Type 추가</strong> 카드를 눌러 시작해 보세요.
          </EmptyState>
        )}

        <button className="secondary-btn" onClick={closeModal}>
          취소
        </button>
      </>
    );
  }

  /* =================================================================
     Step 2) 선택된 카테고리 안에서 종목 고르기
  ================================================================= */
  return (
    <>
      <div className="picker-header">
        <button type="button" className="picker-back" onClick={goToCategory} aria-label="뒤로">
          ‹
        </button>
        <div className="picker-title">
          <span
            className="picker-cat-pill"
            style={{ background: cat?.color || '#ccc' }}
          >
            {cat?.name || '?'}
          </span>
          <span className="picker-step-sub">
            2단계 · 종목을 골라주세요
          </span>
        </div>
        <span
          className="picker-date"
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 12,
            color: 'var(--ink-3)',
          }}
        >
          {yy}.{mm}.{dd}
        </span>
      </div>

      {/* 검색창 — 그 카테고리 안에서만 필터 */}
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder={`${cat?.name || ''} 안에서 종목 검색`}
        autoFocus
      />

      {/* 종목 그리드 */}
      {filteredExs.length === 0 ? (
        <div style={{ padding: '14px 4px' }}>
          {ql ? (
            <EmptyState emoji="🔍" style={{ padding: '20px 10px' }}>
              "{query}"에 맞는 종목이 없어요.
              <button
                type="button"
                className="quick-add-from-search"
                onClick={() => handleAddExercise(query.trim())}
              >
                ＋ "{query.trim()}" 으로 추가하기
              </button>
            </EmptyState>
          ) : (
            <EmptyState emoji="🌱" style={{ padding: '20px 10px' }}>
              아직 이 부위에 종목이 없어요.
              <br />
              아래 <strong>＋ 새 종목 추가</strong> 로 추가해 보세요.
            </EmptyState>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginBottom: 10,
          }}
        >
          {filteredExs.map((e) => (
            <button
              key={e.id}
              type="button"
              className="ex-card"
              onClick={() => pickExercise(e.id)}
            >
              <span className="cat" style={{ background: cat.color, color: 'var(--ink)' }}>
                {cat.name}
              </span>
              <div className="nm">{e.name}</div>
            </button>
          ))}
        </div>
      )}

      {/* + 새 종목 추가 (그리드 아래에 항상 노출) */}
      {!showAddEx ? (
        <button
          type="button"
          className="add-set"
          style={{ marginTop: 6 }}
          onClick={() => {
            setShowAddEx(true);
            // 검색 중이었다면 검색어를 그대로 새 종목 후보로 — 사용자 의도 보존
            setNewExName(query.trim());
          }}
        >
          ＋ {cat?.name} 운동 추가
        </button>
      ) : (
        <div className="inline-add" style={{ marginTop: 6 }}>
          <input
            autoFocus
            placeholder={`${cat?.name || ''}에 추가할 새 종목 (예: 인클라인 벤치)`}
            value={newExName}
            onChange={(e) => setNewExName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddExercise();
              } else if (e.key === 'Escape') {
                setShowAddEx(false);
                setNewExName('');
              }
            }}
            maxLength={20}
          />
          <button
            type="button"
            className="inline-add-confirm"
            onClick={() => handleAddExercise()}
            disabled={!newExName.trim()}
          >
            추가
          </button>
          <button
            type="button"
            className="inline-add-cancel"
            onClick={() => {
              setShowAddEx(false);
              setNewExName('');
            }}
          >
            ×
          </button>
        </div>
      )}

      <button className="secondary-btn" onClick={closeModal}>
        취소
      </button>
    </>
  );
}
