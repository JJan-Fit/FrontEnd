/**
 * 운동 뷰 상단의 큰 카드 — 오늘의 총 세트 수.
 *
 * @param {{ totalSets: number, sessionCount: number }} props
 */
export default function WorkoutHero({ totalSets, sessionCount }) {
  return (
    <div className="wo-hero">
      <div className="h-sub">오늘의 세트</div>
      <div className="h-big">{totalSets}</div>
      <div className="h-mini">{sessionCount}개 운동 진행</div>
    </div>
  );
}
