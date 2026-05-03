import { useApp } from '../../context/AppContext.jsx';
import {
  DEFAULT_EXPENSE_COLOR,
  DEFAULT_INCOME_COLOR,
} from '../../constants/defaults.js';
import TypeListSection from './TypeListSection.jsx';
import WorkoutCatList from './WorkoutCatList.jsx';
import ColorCustomizer from './ColorCustomizer.jsx';
import DataSection from './DataSection.jsx';

/**
 * 설정 뷰 — 네 번째 탭.
 *
 * 섹션 구성:
 *   - 수입 종류
 *   - 지출 종류
 *   - 운동 카테고리/종목
 *   - 차트 색상
 *   - 데이터 (통계 + 초기화)
 */
export default function SettingsView() {
  const { state } = useApp();
  const incColor = state.settings.incomeColor || DEFAULT_INCOME_COLOR;
  const expColor = state.settings.expenseColor || DEFAULT_EXPENSE_COLOR;

  return (
    <>
      <TypeListSection
        storeKey="incomeTypes"
        title="수입 종류"
        emoji="💰"
        dotColor={incColor}
        placeholder="새 수입 종류"
      />
      <TypeListSection
        storeKey="expenseTypes"
        title="지출 종류"
        emoji="💳"
        dotColor={expColor}
        placeholder="새 지출 종류"
      />
      <WorkoutCatList />
      <ColorCustomizer />
      <DataSection />
    </>
  );
}
