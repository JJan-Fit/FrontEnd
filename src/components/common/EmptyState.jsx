/**
 * 데이터가 없을 때 표시되는 안내 박스.
 * 운동/거래/검색 결과 없음 등 다양한 위치에서 재사용된다.
 *
 * @param {{ emoji?: string, children: React.ReactNode, style?: React.CSSProperties }} props
 */
export default function EmptyState({ emoji = '✨', children, style }) {
  return (
    <div className="empty" style={style}>
      <span className="emoji">{emoji}</span>
      {children}
    </div>
  );
}
