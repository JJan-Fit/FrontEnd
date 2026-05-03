import { useMemo } from 'react';
import TransactionRow from '../common/TransactionRow.jsx';
import EmptyState from '../common/EmptyState.jsx';

/**
 * 최근 10건의 수입/지출만 보여주는 리스트.
 * 운동 기록은 의도적으로 제외 — "최근 내역" 섹션은 머니 위주.
 */
export default function RecentList({ records, incomeTypes, expenseTypes, workoutCats }) {
  const recent = useMemo(() => {
    return records
      .filter((r) => r.kind === 'income' || r.kind === 'expense')
      .sort((a, b) => {
        const A = a.date + 'T' + (a.time || '00:00');
        const B = b.date + 'T' + (b.time || '00:00');
        return B.localeCompare(A);
      })
      .slice(0, 10);
  }, [records]);

  if (recent.length === 0) {
    return (
      <div className="tx-list">
        <EmptyState emoji="✨">
          기록이 없어요.
          <br />
          달력에서 오늘 날짜를 눌러 시작해 보세요!
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="tx-list">
      {recent.map((r) => (
        <TransactionRow
          key={r.id}
          record={r}
          incomeTypes={incomeTypes}
          expenseTypes={expenseTypes}
          workoutCats={workoutCats}
        />
      ))}
    </div>
  );
}
