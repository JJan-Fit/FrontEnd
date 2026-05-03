import { findById } from '../../utils/id.js';
import { fmtKRW } from '../../utils/format.js';

/**
 * 모든 종류(record)의 행을 한 컴포넌트로 처리한다.
 *
 * - kind === 'income'  : 💰 수입
 * - kind === 'expense' : 💳 지출
 * - kind === 'workout' : 💪 운동 세션 (세트 수, 총 볼륨)
 *
 * @param {{
 *   record: any,
 *   incomeTypes: any[],
 *   expenseTypes: any[],
 *   workoutCats: any[],
 *   onEdit?: (record: any) => void,
 *   onDelete?: (record: any) => void,
 * }} props
 */
export default function TransactionRow({
  record,
  incomeTypes,
  expenseTypes,
  workoutCats,
  onEdit,
  onDelete,
}) {
  const [, m, d] = record.date.split('-');
  const dateLbl = `${m}.${d}`;

  // 수입 / 지출 / 운동 별로 본문 마크업이 달라 분기한다 (한 컴포넌트로 묶어 흩어지지 않게)
  let body;
  if (record.kind === 'income') {
    const tn = findById(incomeTypes, record.typeId)?.name || '?';
    body = (
      <>
        <div className="tag in">💰</div>
        <div className="info">
          <div className="t1">{tn}</div>
          <div className="t2">
            {dateLbl} · {record.time || ''}
          </div>
        </div>
        <div className="amt in">+{fmtKRW(record.amount)}</div>
      </>
    );
  } else if (record.kind === 'expense') {
    const tn = findById(expenseTypes, record.typeId)?.name || '?';
    body = (
      <>
        <div className="tag out">💳</div>
        <div className="info">
          <div className="t1">{tn}</div>
          <div className="t2">
            {dateLbl} · {record.time || ''}
          </div>
        </div>
        <div className="amt out">-{fmtKRW(record.amount)}</div>
      </>
    );
  } else if (record.kind === 'workout') {
    const cat = findById(workoutCats, record.categoryId);
    const ex = cat?.exercises.find((e) => e.id === record.exerciseId);
    const totalSets = (record.sets || []).length;
    // 볼륨 = 모든 세트의 (무게 × 횟수) 합. 운동 강도 비교용.
    const volume = (record.sets || []).reduce(
      (a, s) => a + (Number(s.w) || 0) * (Number(s.r) || 0),
      0
    );
    body = (
      <>
        <div className="tag wo">💪</div>
        <div className="info">
          <div className="t1">
            {ex?.name || '운동'} ·{' '}
            <span className="muted" style={{ fontWeight: 500 }}>
              {cat?.name || ''}
            </span>
          </div>
          <div className="t2">
            {dateLbl} · {record.time || ''}
          </div>
        </div>
        <div
          className="amt"
          style={{ color: '#7a5bbf', fontSize: 12, textAlign: 'right', lineHeight: 1.35 }}
        >
          {totalSets}세트
          <br />
          <span style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 500 }}>
            {volume.toLocaleString()}kg·rep
          </span>
        </div>
      </>
    );
  } else {
    return null;
  }

  return (
    <div className="tx">
      {body}
      {(onEdit || onDelete) && (
        <div className="row-actions">
          {onEdit && (
            <button className="edit" title="수정" onClick={() => onEdit(record)}>
              ✎
            </button>
          )}
          {onDelete && (
            <button className="del" title="삭제" onClick={() => onDelete(record)}>
              ×
            </button>
          )}
        </div>
      )}
    </div>
  );
}
