import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { todayStr } from '../../utils/date.js';
import CalendarModeSwitch from './CalendarModeSwitch.jsx';
import CalendarTopCard from './CalendarTopCard.jsx';
import CalendarGrid from './CalendarGrid.jsx';
import DayPanel from './DayPanel.jsx';
import MoneyModal from '../modals/MoneyModal.jsx';
import WorkoutPicker from '../modals/WorkoutPicker.jsx';
import SessionModal from '../modals/SessionModal.jsx';

/**
 * 달력 뷰 — 두 번째 탭.
 *
 * - 모드 전환 (머니/운동) 에 따라 그리드 표현·일별 패널·요약 카드가 모두 바뀐다.
 * - 셀 클릭 시 selectedDate 변경 + DayPanel 로 스크롤
 * - DayPanel 의 액션(추가/편집/삭제) 은 모달 또는 confirm 으로 위임
 */
export default function CalendarView() {
  const { state, actions } = useApp();
  const { openModal } = useModal();
  const toast = useToast();

  // 보고 있는 월 (year/month) 와 선택된 날짜
  const initialDate = todayStr();
  const initial = new Date();
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [mode, setMode] = useState('money'); // 'money' | 'workout'

  /* ---------- 월 이동 ---------- */
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };
  const goToday = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDate(todayStr());
  };

  /* ---------- 셀 선택 ---------- */
  const handleSelect = (dateStr) => {
    setSelectedDate(dateStr);
    // 다음 페인트 후 패널로 스크롤 — 모바일에서 셀 → 상세로 자연스럽게 이어짐
    setTimeout(() => {
      document.getElementById('dayPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  /* ---------- 모달 트리거 ---------- */
  const openMoneyModal = (kind, existingId = null) => {
    openModal(
      <MoneyModal kind={kind} defaultDate={selectedDate} existingId={existingId} />
    );
  };

  const openWorkoutPicker = () => {
    if (state.workoutCats.length === 0) {
      toast('먼저 설정에서 카테고리를 추가해 주세요');
      return;
    }
    openModal(<WorkoutPicker defaultDate={selectedDate} />);
  };

  const editRecord = (record) => {
    if (record.kind === 'income' || record.kind === 'expense') {
      openMoneyModal(record.kind, record.id);
    } else if (record.kind === 'workout') {
      openModal(
        <SessionModal
          catId={record.categoryId}
          exId={record.exerciseId}
          defaultDate={record.date}
          existingRecId={record.id}
        />
      );
    }
  };

  const deleteRecord = (record) => {
    if (!confirm('이 기록을 삭제할까요?')) return;
    actions.deleteRecord(record.id);
    toast('삭제 완료');
  };

  return (
    <>
      <CalendarModeSwitch mode={mode} onChange={setMode} />

      <CalendarTopCard
        mode={mode}
        year={year}
        month={month}
        records={state.records}
        workoutCats={state.workoutCats}
      />

      {/* 월 네비 + 요일 헤더 */}
      <div className="cal-hdr">
        <div className="month">
          {year}년 {month + 1}월
        </div>
        <div className="nav">
          <button onClick={prevMonth}>‹</button>
          <button onClick={goToday} title="오늘">
            ●
          </button>
          <button onClick={nextMonth}>›</button>
        </div>
      </div>
      <div className="cal-weekdays">
        <span>일</span>
        <span>월</span>
        <span>화</span>
        <span>수</span>
        <span>목</span>
        <span>금</span>
        <span>토</span>
      </div>

      <CalendarGrid
        year={year}
        month={month}
        mode={mode}
        selectedDate={selectedDate}
        records={state.records}
        workoutCats={state.workoutCats}
        onSelect={handleSelect}
      />

      <DayPanel
        selectedDate={selectedDate}
        mode={mode}
        records={state.records}
        incomeTypes={state.incomeTypes}
        expenseTypes={state.expenseTypes}
        workoutCats={state.workoutCats}
        onAddIncome={() => openMoneyModal('income')}
        onAddExpense={() => openMoneyModal('expense')}
        onAddWorkout={openWorkoutPicker}
        onEdit={editRecord}
        onDelete={deleteRecord}
      />
    </>
  );
}
