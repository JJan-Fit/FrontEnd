import { useMemo } from 'react';
import { pad } from '../../utils/date.js';
import { fmtKRW, fmtKRWShort } from '../../utils/format.js';
import { findById } from '../../utils/id.js';

/**
 * 달력 위에 떠 있는 월간 요약 카드.
 *
 * - 머니 모드 : 이번 달 수입·지출·잔액, 전월 대비 비교
 * - 운동 모드 : 운동 일수, 가장 많이 한 운동, 카테고리 분포
 *
 * @param {{
 *   mode: 'money' | 'workout',
 *   year: number,
 *   month: number,            // 0-indexed
 *   records: any[],
 *   workoutCats: any[],
 * }} props
 */
export default function CalendarTopCard({ mode, year, month, records, workoutCats }) {
  // 이번 달 / 지난달 시작·종료 문자열을 한 번만 계산
  const ranges = useMemo(() => {
    const mStart = `${year}-${pad(month + 1)}-01`;
    const mEnd = `${year}-${pad(month + 1)}-${pad(new Date(year, month + 1, 0).getDate())}`;
    const prevY = month === 0 ? year - 1 : year;
    const prevM = month === 0 ? 11 : month - 1;
    const pmStart = `${prevY}-${pad(prevM + 1)}-01`;
    const pmEnd = `${prevY}-${pad(prevM + 1)}-${pad(new Date(prevY, prevM + 1, 0).getDate())}`;
    return { mStart, mEnd, pmStart, pmEnd };
  }, [year, month]);

  // 모드별 데이터 가공
  const data = useMemo(() => {
    if (mode === 'money') return calcMoneyMonth(records, ranges);
    return calcWorkoutMonth(records, ranges.mStart, ranges.mEnd, workoutCats);
  }, [mode, records, ranges, workoutCats]);

  return (
    <div className="cal-card cal-topcard">
      <div className="label">
        {year}년 {month + 1}월 · {mode === 'money' ? '수입/지출' : '운동'}
      </div>

      {mode === 'money' ? <MoneyBody {...data} /> : <WorkoutBody {...data} />}
    </div>
  );
}

/* =======================================================
   머니 모드 본문
   ======================================================= */
function MoneyBody({ curIn, curOut, dIn, dOut }) {
  return (
    <>
      <div className="money-totals">
        <div className="tt">
          <div className="t">수입</div>
          <div className="v in">+{fmtKRW(curIn)}</div>
        </div>
        <div className="tt">
          <div className="t">지출</div>
          <div className="v out">-{fmtKRW(curOut)}</div>
        </div>
        <div className="tt">
          <div className="t">잔액</div>
          <div className="v">{fmtKRW(curIn - curOut)}</div>
        </div>
      </div>
      <div className="compare">
        <div className="line">
          💰 <CompareLine delta={dIn} kind="income" />
        </div>
        <div className="line">
          💳 <CompareLine delta={dOut} kind="expense" />
        </div>
      </div>
    </>
  );
}

/** 전월 대비 한 줄 — 수입은 +가 좋음, 지출은 -가 좋음 */
function CompareLine({ delta, kind }) {
  if (delta === 0) {
    return (
      <span>
        전월과 동일 <span className="v">—</span>
      </span>
    );
  }
  if (kind === 'income') {
    return delta > 0 ? (
      <span>
        지난 달보다 <span className="v up">{fmtKRWShort(delta)} 더 벌었어요</span> 🙂
      </span>
    ) : (
      <span>
        지난 달보다 <span className="v down">{fmtKRWShort(-delta)} 덜 벌었어요</span>
      </span>
    );
  }
  // expense
  return delta < 0 ? (
    <span>
      지난 달보다 <span className="v up">{fmtKRWShort(-delta)} 덜 썼어요</span> 👍
    </span>
  ) : (
    <span>
      지난 달보다 <span className="v down">{fmtKRWShort(delta)} 더 썼어요</span>
    </span>
  );
}

/* =======================================================
   운동 모드 본문
   ======================================================= */
function WorkoutBody({ daysCount, totalSessions, topExName, topCatName, topCount, catRows }) {
  return (
    <>
      <div className="wo-stats">
        <div className="wtile">
          <div className="t">운동 일수</div>
          <div className="v">{daysCount}일</div>
          <div className="sub">총 {totalSessions}회 세션</div>
        </div>
        <div className="wtile">
          <div className="t">가장 많이 한 운동</div>
          <div className="v" style={{ fontSize: 14 }}>
            {topExName}
          </div>
          <div className="sub">
            {topCatName ? topCatName + ' · ' : ''}
            {topCount || 0}회
          </div>
        </div>
      </div>

      {catRows.length > 0 && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: '1px dashed var(--line)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          {catRows.map((row) => (
            <span
              key={row.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '3px 8px',
                background: row.color + '33',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: row.color,
                }}
              />
              {row.name} {row.count}회
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* =======================================================
   순수 계산 함수
   ======================================================= */
function calcMoneyMonth(records, { mStart, mEnd, pmStart, pmEnd }) {
  let curIn = 0;
  let curOut = 0;
  let prevIn = 0;
  let prevOut = 0;

  records.forEach((r) => {
    if (r.kind !== 'income' && r.kind !== 'expense') return;
    if (r.date >= mStart && r.date <= mEnd) {
      if (r.kind === 'income') curIn += r.amount;
      else curOut += r.amount;
    }
    if (r.date >= pmStart && r.date <= pmEnd) {
      if (r.kind === 'income') prevIn += r.amount;
      else prevOut += r.amount;
    }
  });

  return {
    curIn,
    curOut,
    dIn: curIn - prevIn, // +이면 더 벌었음
    dOut: curOut - prevOut, // -이면 덜 썼음
  };
}

function calcWorkoutMonth(records, mStart, mEnd, workoutCats) {
  const workouts = records.filter(
    (r) => r.kind === 'workout' && r.date >= mStart && r.date <= mEnd
  );
  const days = new Set(workouts.map((r) => r.date));

  // 종목별 카운트
  const exCount = {};
  workouts.forEach((r) => {
    exCount[r.exerciseId] = (exCount[r.exerciseId] || 0) + 1;
  });
  let topEx = null;
  let topCount = 0;
  Object.keys(exCount).forEach((eid) => {
    if (exCount[eid] > topCount) {
      topEx = eid;
      topCount = exCount[eid];
    }
  });
  let topExName = '—';
  let topCatName = '';
  if (topEx) {
    for (const c of workoutCats) {
      const e = c.exercises.find((x) => x.id === topEx);
      if (e) {
        topExName = e.name;
        topCatName = c.name;
        break;
      }
    }
  }

  // 카테고리 분포 (Top 3)
  const catCount = {};
  workouts.forEach((r) => {
    catCount[r.categoryId] = (catCount[r.categoryId] || 0) + 1;
  });
  const catRows = Object.keys(catCount)
    .sort((a, b) => catCount[b] - catCount[a])
    .slice(0, 3)
    .map((cid) => {
      const c = findById(workoutCats, cid);
      return {
        id: cid,
        name: c?.name || '?',
        color: c?.color || '#888',
        count: catCount[cid],
      };
    });

  return {
    daysCount: days.size,
    totalSessions: workouts.length,
    topExName,
    topCatName,
    topCount,
    catRows,
  };
}
