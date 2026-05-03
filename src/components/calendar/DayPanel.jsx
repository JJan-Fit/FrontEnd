import { useMemo } from 'react';
import { DOW_KOR } from '../../constants/defaults.js';
import { fmtKRW } from '../../utils/format.js';
import EmptyState from '../common/EmptyState.jsx';
import TransactionRow from '../common/TransactionRow.jsx';

/**
 * 선택된 날짜의 상세 패널.
 *
 * - 날짜 / 요일 표시
 * - 모드별 합계 (머니: 수입/지출 / 운동: 세션·세트)
 * - 액션 버튼 (수입 / 지출 / 운동 시작)
 * - 그날의 기록 목록 (편집/삭제)
 *
 * @param {{
 *   selectedDate: string,
 *   mode: 'money' | 'workout',
 *   records: any[],
 *   incomeTypes: any[],
 *   expenseTypes: any[],
 *   workoutCats: any[],
 *   onAddIncome: () => void,
 *   onAddExpense: () => void,
 *   onAddWorkout: () => void,
 *   onEdit: (record: any) => void,
 *   onDelete: (record: any) => void,
 * }} props
 */
export default function DayPanel({
  selectedDate,
  mode,
  records,
  incomeTypes,
  expenseTypes,
  workoutCats,
  onAddIncome,
  onAddExpense,
  onAddWorkout,
  onEdit,
  onDelete,
}) {
  const [y, m, d] = selectedDate.split('-');
  const dow = new Date(+y, +m - 1, +d).getDay();

  // 그 날짜의 기록만 필터 + 모드에 맞게 한 번 더 필터
  const dayRecs = useMemo(() => {
    const all = records.filter((r) => r.date === selectedDate);
    const filtered =
      mode === 'workout'
        ? all.filter((r) => r.kind === 'workout')
        : all.filter((r) => r.kind === 'income' || r.kind === 'expense');
    return filtered.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
  }, [records, selectedDate, mode]);

  // 합계
  const totals = useMemo(() => {
    if (mode === 'workout') {
      const sessCount = dayRecs.length;
      const totalSets = dayRecs.reduce((a, r) => a + (r.sets?.length || 0), 0);
      return { sessCount, totalSets };
    }
    let sumIn = 0;
    let sumOut = 0;
    dayRecs.forEach((r) => {
      if (r.kind === 'income') sumIn += r.amount;
      if (r.kind === 'expense') sumOut += r.amount;
    });
    return { sumIn, sumOut };
  }, [dayRecs, mode]);

  return (
    <div className="day-panel" id="dayPanel">
      <h3>
        <span className="dt">
          {y}.{m}.{d}
        </span>
        <span className="dw">{DOW_KOR[dow]}요일</span>
      </h3>

      {/* 합계 */}
      <div className="day-totals">
        {mode === 'workout' ? (
          <>
            <div className="t" style={{ background: 'rgba(199,179,232,.25)' }}>
              <div className="lbl">오늘 세션</div>
              <div className="v" style={{ color: '#7A5BBF' }}>
                {totals.sessCount}개
              </div>
            </div>
            <div className="t" style={{ background: 'rgba(199,179,232,.25)' }}>
              <div className="lbl">총 세트</div>
              <div className="v" style={{ color: '#7A5BBF' }}>
                {totals.totalSets}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="t in">
              <div className="lbl">수입</div>
              <div className="v">{fmtKRW(totals.sumIn)}</div>
            </div>
            <div className="t out">
              <div className="lbl">지출</div>
              <div className="v">{fmtKRW(totals.sumOut)}</div>
            </div>
          </>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="day-actions">
        {mode === 'workout' ? (
          <button className="action-btn wo" style={{ flex: 1 }} onClick={onAddWorkout}>
            💪 운동 시작
          </button>
        ) : (
          <>
            <button className="action-btn in" onClick={onAddIncome}>
              💰 수입
            </button>
            <button className="action-btn out" onClick={onAddExpense}>
              💳 지출
            </button>
          </>
        )}
      </div>

      {/* 기록 리스트 */}
      <div>
        {dayRecs.length === 0 ? (
          <EmptyState emoji="🌿" style={{ padding: 18 }}>
            {mode === 'workout' ? (
              <>
                운동 기록이 없어요.
                <br />위 버튼으로 오늘 운동을 추가해 보세요.
              </>
            ) : (
              <>
                기록이 없어요.
                <br />위 버튼으로 수입/지출을 추가해 보세요.
              </>
            )}
          </EmptyState>
        ) : (
          dayRecs.map((r) => (
            <TransactionRow
              key={r.id}
              record={r}
              incomeTypes={incomeTypes}
              expenseTypes={expenseTypes}
              workoutCats={workoutCats}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
