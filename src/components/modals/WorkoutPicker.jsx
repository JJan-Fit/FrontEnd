import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import SearchInput from '../common/SearchInput.jsx';
import EmptyState from '../common/EmptyState.jsx';
import SessionModal from './SessionModal.jsx';

/**
 * 운동 시작 시 종목을 고르기 위한 피커 모달.
 *
 * - 카테고리별로 종목을 그룹지어 보여줌
 * - 검색어가 있으면 매칭되지 않는 카테고리는 숨김
 * - 종목을 누르면 해당 카테고리/종목으로 SessionModal 을 띄운다
 *
 * @param {{ defaultDate: string }} props
 */
export default function WorkoutPicker({ defaultDate }) {
  const { state } = useApp();
  const { openModal, closeModal } = useModal();
  const [query, setQuery] = useState('');

  const [yy, mm, dd] = defaultDate.split('-');

  const ql = query.trim().toLowerCase();

  // 카테고리별 — 필터 결과가 비어있는 카테고리는 숨김
  const filteredCats = state.workoutCats
    .map((c) => {
      const exs = ql
        ? c.exercises.filter(
            (e) => e.name.toLowerCase().includes(ql) || c.name.toLowerCase().includes(ql)
          )
        : c.exercises;
      return { ...c, _filteredExs: exs };
    })
    .filter((c) => !ql || c._filteredExs.length > 0);

  const handlePick = (catId, exId) => {
    closeModal();
    // 닫힘 트랜지션 직후 새 모달 열기
    setTimeout(() => {
      openModal(<SessionModal catId={catId} exId={exId} defaultDate={defaultDate} />);
    }, 240);
  };

  return (
    <>
      <h3>
        <span className="em">💪</span>운동 시작 ·{' '}
        <span
          style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, color: 'var(--ink-3)' }}
        >
          {yy}.{mm}.{dd}
        </span>
      </h3>

      {/* 검색 — 일반 SearchInput 을 그대로 사용 */}
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="운동명 검색 (예: 벤치, 데드)"
        autoFocus
      />

      {filteredCats.length === 0 ? (
        <EmptyState emoji="🔍" style={{ padding: '30px 10px' }}>
          "{query}"에 맞는 운동이 없어요.
          <br />
          <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            설정에서 새 운동을 추가해 보세요
          </span>
        </EmptyState>
      ) : (
        filteredCats.map((c) => (
          <div key={c.id} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span
                style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }}
              />
              <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
              <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>
                {c._filteredExs.length}개
              </span>
            </div>

            {c._filteredExs.length === 0 ? (
              <div className="muted" style={{ fontSize: 12, padding: 4 }}>
                종목을 추가해 주세요
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {c._filteredExs.map((e) => (
                  <button
                    key={e.id}
                    className="ex-card"
                    onClick={() => handlePick(c.id, e.id)}
                  >
                    <span className="cat" style={{ background: c.color, color: 'var(--ink)' }}>
                      {c.name}
                    </span>
                    <div className="nm">{e.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      <button className="secondary-btn" onClick={closeModal}>
        취소
      </button>
    </>
  );
}
