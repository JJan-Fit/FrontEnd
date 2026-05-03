import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { todayStr } from '../../utils/date.js';
import { findById } from '../../utils/id.js';
import WorkoutHero from './WorkoutHero.jsx';
import WeightCard from './WeightCard.jsx';
import CategoryChips from './CategoryChips.jsx';
import ExerciseGrid from './ExerciseGrid.jsx';
import SessionList from './SessionList.jsx';
import SectionTitle from '../common/SectionTitle.jsx';
import SearchInput from '../common/SearchInput.jsx';
import SessionModal from '../modals/SessionModal.jsx';

/**
 * 운동 뷰 — 세 번째 탭.
 *
 * 구성:
 *   1. 히어로 카드 (오늘의 총 세트)
 *   2. 몸무게 트래커
 *   3. 검색창
 *   4. 카테고리 칩 (선택된 카테고리 한 개)
 *   5. 종목 그리드 (해당 카테고리 + 검색 필터 적용)
 *   6. 오늘의 세션 리스트
 */
export default function WorkoutView() {
  const { state, actions } = useApp();
  const { openModal } = useModal();
  const toast = useToast();

  const [selectedCatId, setSelectedCatId] = useState(null);
  const [search, setSearch] = useState('');

  // 카테고리가 비어있다가 채워지거나, 선택된 카테고리가 삭제되면 자동 보정
  useEffect(() => {
    if (state.workoutCats.length === 0) {
      if (selectedCatId !== null) setSelectedCatId(null);
      return;
    }
    if (!findById(state.workoutCats, selectedCatId)) {
      setSelectedCatId(state.workoutCats[0].id);
    }
  }, [state.workoutCats, selectedCatId]);

  /* ---------- 오늘 세션 ---------- */
  const today = todayStr();
  const todaySessions = useMemo(
    () => state.records.filter((r) => r.kind === 'workout' && r.date === today),
    [state.records, today]
  );
  const totalSets = todaySessions.reduce((a, s) => a + (s.sets?.length || 0), 0);

  /* ---------- 종목 그리드 데이터 ---------- */
  const cat = findById(state.workoutCats, selectedCatId);
  const ql = search.trim().toLowerCase();
  const exercises = cat
    ? ql
      ? cat.exercises.filter((e) => e.name.toLowerCase().includes(ql))
      : cat.exercises
    : [];

  /* ---------- 액션 ---------- */
  const startSession = (catId, exId) => {
    openModal(<SessionModal catId={catId} exId={exId} defaultDate={today} />);
  };
  const editSession = (record) => {
    openModal(
      <SessionModal
        catId={record.categoryId}
        exId={record.exerciseId}
        defaultDate={record.date}
        existingRecId={record.id}
      />
    );
  };
  const deleteSession = (record) => {
    if (!confirm('이 운동 기록을 삭제할까요?')) return;
    actions.deleteRecord(record.id);
    toast('삭제됨');
  };

  // 시간 역순 정렬 (불변성 유지)
  const sortedToday = useMemo(
    () => [...todaySessions].sort((a, b) => (b.time || '').localeCompare(a.time || '')),
    [todaySessions]
  );

  return (
    <>
      <WorkoutHero totalSets={totalSets} sessionCount={todaySessions.length} />

      <WeightCard />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="운동명 검색 (예: 벤치, 데드, 스쿼트)"
      />

      <CategoryChips
        cats={state.workoutCats}
        selectedId={selectedCatId}
        onChange={setSelectedCatId}
      />

      <SectionTitle title="운동 목록" hint="탭해서 세션 시작" style={{ marginTop: 4 }} />
      <ExerciseGrid
        cat={cat}
        exercises={exercises}
        records={state.records}
        searchQuery={search}
        onPick={startSession}
        onClearSearch={() => setSearch('')}
      />

      <SectionTitle title="오늘의 세션" hint={`${sortedToday.length}개`} />
      <SessionList
        sessions={sortedToday}
        workoutCats={state.workoutCats}
        onEdit={editSession}
        onDelete={deleteSession}
      />
    </>
  );
}
