import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { DEFAULT_EXPENSE_COLOR, DEFAULT_INCOME_COLOR } from '../../constants/defaults.js';
import SummaryGrid from './SummaryGrid.jsx';
import PeriodSelector from './PeriodSelector.jsx';
import BalanceChart from './BalanceChart.jsx';
import ChartSelectedInfo from './ChartSelectedInfo.jsx';
import RecentList from './RecentList.jsx';
import SectionTitle from '../common/SectionTitle.jsx';

/**
 * 차트 뷰 — 첫 화면.
 *
 * 구성:
 *   1. 요약 (수입/지출/잔액 3분할)
 *   2. 기간 선택 (1주/1개월/3개월/1년)
 *   3. 듀얼 라인 차트 + 거래량 막대
 *   4. 최근 내역 10건
 */
export default function ChartView() {
  const { state } = useApp();

  // 차트 윈도우 — 일 단위
  const [rangeDays, setRangeDays] = useState(30);
  // 차트에서 클릭된 점 (없으면 null)
  const [selectedIdx, setSelectedIdx] = useState(null);

  const inColor = state.settings.incomeColor || DEFAULT_INCOME_COLOR;
  const outColor = state.settings.expenseColor || DEFAULT_EXPENSE_COLOR;

  // 전체 기간 합계 — 요약 카드용 (기간 필터 영향 X)
  const { totalIn, totalOut } = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    state.records.forEach((r) => {
      if (r.kind === 'income') totalIn += r.amount || 0;
      if (r.kind === 'expense') totalOut += r.amount || 0;
    });
    return { totalIn, totalOut };
  }, [state.records]);

  return (
    <>
      <SummaryGrid totalIn={totalIn} totalOut={totalOut} />

      <PeriodSelector
        value={rangeDays}
        onChange={(d) => {
          setRangeDays(d);
          setSelectedIdx(null); // 기간이 바뀌면 선택점이 의미 없어지므로 초기화
        }}
      />

      <ChartSelectedInfo
        records={state.records}
        rangeDays={rangeDays}
        selectedIdx={selectedIdx}
        onClose={() => setSelectedIdx(null)}
      />

      <BalanceChart
        records={state.records}
        rangeDays={rangeDays}
        inColor={inColor}
        outColor={outColor}
        selectedIdx={selectedIdx}
        onSelectIdx={setSelectedIdx}
      />

      <SectionTitle title="최근 내역" hint="최근 10건 · 수입/지출" />
      <RecentList
        records={state.records}
        incomeTypes={state.incomeTypes}
        expenseTypes={state.expenseTypes}
        workoutCats={state.workoutCats}
      />
    </>
  );
}
