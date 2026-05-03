import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import EmptyState from '../common/EmptyState.jsx';

/**
 * 선택한 카테고리의 운동 종목 카드 그리드.
 *
 * 각 카드를 누르면 onPick(catId, exId) 가 호출되어 세션 모달이 뜬다.
 * 그리드 끝에 "+ 종목 추가" 점선 카드가 항상 보이고,
 * 검색 결과가 0건이면 "{검색어}로 추가하기" 빠른 버튼이 등장한다.
 *
 * @param {{
 *   cat: any,                                  // 선택된 카테고리
 *   exercises: any[],                          // (검색 적용된) 종목 배열
 *   records: any[],                            // 통계 계산용
 *   searchQuery?: string,                      // 현재 검색어 — 빠른 추가에 활용
 *   onPick: (catId: string, exId: string) => void,
 *   onClearSearch?: () => void,                // 추가 후 검색어 초기화 콜백 (있으면 호출)
 * }} props
 */
export default function ExerciseGrid({
  cat,
  exercises,
  records,
  searchQuery = '',
  onPick,
  onClearSearch,
}) {
  const { actions } = useApp();
  const toast = useToast();

  // 인라인 종목 추가 폼
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  // ----- 카테고리 자체가 없는 상태 -----
  if (!cat) {
    return (
      <div className="ex-grid">
        <EmptyState emoji="🏋️" style={{ gridColumn: 'span 2' }}>
          카테고리를 선택하세요
        </EmptyState>
      </div>
    );
  }

  /* ---------- 종목 추가 ---------- */
  const openAdd = (preset = '') => {
    setAdding(true);
    setDraft(preset);
  };
  const closeAdd = () => {
    setAdding(false);
    setDraft('');
  };
  const handleConfirmAdd = (forced) => {
    const nm = (forced ?? draft).trim();
    if (!nm) return;
    actions.addExercise(cat.id, nm);
    toast(`"${nm}" 추가됨`);
    closeAdd();
    // 추가한 종목이 검색 결과에 묻혀 안 보이지 않도록 검색어 정리
    if (onClearSearch) onClearSearch();
  };

  /* ---------- 종목 삭제 ---------- */
  const handleDeleteExercise = (e, ex) => {
    e.stopPropagation(); // 부모 카드의 onPick 호출 막기

    // 이 종목으로 기록된 세션 수를 안내해 사용자가 신중히 결정하도록
    const sessionCount = (records || []).filter(
      (r) => r.kind === 'workout' && r.exerciseId === ex.id
    ).length;
    const lines = [`"${ex.name}" 종목을 삭제할까요?`];
    if (sessionCount > 0) {
      lines.push(`기존 운동 기록 ${sessionCount}개는 그대로 남습니다 (이름만 빠짐).`);
    }
    if (!confirm(lines.join('\n'))) return;

    actions.deleteExercise(cat.id, ex.id);
    toast('종목 삭제됨');
  };

  const ql = searchQuery.trim();
  const showSearchAdd = exercises.length === 0 && !!ql;

  return (
    <div className="ex-grid-wrap">
      {/* 검색 결과 0건 + 검색어가 있는 경우 — 검색어 그대로 추가 가능 */}
      {showSearchAdd ? (
        <EmptyState emoji="🔍" style={{ padding: '20px 10px' }}>
          "{ql}" 에 맞는 종목이 없어요.
          <button
            type="button"
            className="quick-add-from-search"
            onClick={() => handleConfirmAdd(ql)}
          >
            ＋ "{ql}" 으로 추가하기
          </button>
        </EmptyState>
      ) : exercises.length === 0 ? (
        // 카테고리는 있지만 종목이 하나도 없는 경우
        <EmptyState emoji="🌱" style={{ padding: '20px 10px' }}>
          이 부위에 종목이 없어요.
          <br />
          아래 <strong>＋ 종목 추가</strong> 로 시작해 보세요.
        </EmptyState>
      ) : (
        <div className="ex-grid">
          {exercises.map((e) => {
            const exRecs = records.filter(
              (r) => r.kind === 'workout' && r.exerciseId === e.id
            );
            const sessCount = exRecs.length;
            const maxW = exRecs.reduce((mx, r) => {
              const m = (r.sets || []).reduce(
                (mm, s) => Math.max(mm, Number(s.w) || 0),
                0
              );
              return Math.max(mx, m);
            }, 0);
            return (
              <button
                key={e.id}
                type="button"
                className="ex-card"
                onClick={() => onPick(cat.id, e.id)}
              >
                {/* 카드 우상단 ✕ — 카드 클릭(=세션 시작)과 분리된 영역 */}
                <span
                  role="button"
                  tabIndex={0}
                  className="ex-card-del"
                  aria-label={`${e.name} 삭제`}
                  title="이 종목 삭제"
                  onClick={(ev) => handleDeleteExercise(ev, e)}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                      ev.preventDefault();
                      handleDeleteExercise(ev, e);
                    }
                  }}
                >
                  ×
                </span>
                <span
                  className="cat"
                  style={{ background: cat.color, color: 'var(--ink)' }}
                >
                  {cat.name}
                </span>
                <div className="nm">{e.name}</div>
                <div className="stat">
                  {sessCount}회 · 최고 {maxW}kg
                </div>
              </button>
            );
          })}

          {/* 그리드 끝: + 종목 추가 카드 — 그리드 안에 함께 배치해 한 화면에 보임 */}
          <button
            type="button"
            className="ex-card ex-card-add"
            onClick={() => openAdd(ql)}
          >
            <span className="ex-card-add-icon">＋</span>
            <div className="nm">새 종목 추가</div>
            <div className="stat">"{cat.name}" 부위에 추가</div>
          </button>
        </div>
      )}

      {/* 그리드/엠프티 아래에 항상 노출되는 추가 진입 버튼 (엠프티 상태 전용) */}
      {exercises.length === 0 && !adding && (
        <button
          type="button"
          className="add-set"
          style={{ marginTop: 8 }}
          onClick={() => openAdd(ql)}
        >
          ＋ {cat.name} 운동 추가
        </button>
      )}

      {/* 인라인 입력 폼 — adding 일 때만 노출 */}
      {adding && (
        <div className="inline-add" style={{ marginTop: 8 }}>
          <input
            autoFocus
            placeholder={`${cat.name}에 추가할 새 종목 (예: 인클라인 벤치)`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirmAdd();
              } else if (e.key === 'Escape') {
                closeAdd();
              }
            }}
            maxLength={20}
          />
          <button
            type="button"
            className="inline-add-confirm"
            onClick={() => handleConfirmAdd()}
            disabled={!draft.trim()}
          >
            추가
          </button>
          <button
            type="button"
            className="inline-add-cancel"
            onClick={closeAdd}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
