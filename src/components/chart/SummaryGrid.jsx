import { fmtKRW } from '../../utils/format.js';

/**
 * 차트 뷰 상단의 3분할 요약 카드 — 총 수입 / 총 지출 / 잔액.
 * 총합은 모든 기간의 누적 합계 (필터링 X — 항상 전체 데이터 기준).
 */
export default function SummaryGrid({ totalIn, totalOut }) {
  const balance = totalIn - totalOut;
  return (
    <div className="summary-grid">
      <div className="stat">
        <div className="lbl">수입</div>
        <div className="val in">{fmtKRW(totalIn)}</div>
      </div>
      <div className="stat">
        <div className="lbl">지출</div>
        <div className="val out">{fmtKRW(totalOut)}</div>
      </div>
      <div className="stat">
        <div className="lbl">잔액</div>
        <div className="val bal">{fmtKRW(balance)}</div>
      </div>
    </div>
  );
}
