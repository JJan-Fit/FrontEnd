/**
 * "최근 내역 · 최근 10건"  같은 섹션 헤더.
 *
 * @param {{ title: string, hint?: string, style?: React.CSSProperties }} props
 */
export default function SectionTitle({ title, hint, style }) {
  return (
    <div className="section-title" style={style}>
      <h2>{title}</h2>
      {hint && <span className="muted">{hint}</span>}
    </div>
  );
}
