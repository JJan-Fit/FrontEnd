import { useMemo } from 'react';
import { pad, todayStr } from '../../utils/date.js';
import { fmtKRWTiny } from '../../utils/format.js';
import { findById } from '../../utils/id.js';

/**
 * 한 달치 셀 그리드를 그린다.
 *
 * - 일~토 요일 헤더는 부모(CalendarView)에서 별도 그림
 * - 모드에 따라 셀 안에 다른 내용을 렌더 (머니: 합계, 운동: 카테고리 점)
 *
 * @param {{
 *   year: number,
 *   month: number,                 // 0-indexed
 *   mode: 'money' | 'workout',
 *   selectedDate: string,
 *   records: any[],
 *   workoutCats: any[],
 *   onSelect: (dateStr: string) => void,
 * }} props
 */
const MAX_DOTS_PER_DAY = 4;

export default function CalendarGrid({
  year,
  month,
  mode,
  selectedDate,
  records,
  workoutCats,
  onSelect,
}) {
  // 일자별 records 인덱스
  const byDate = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [records]);

  const firstDow = new Date(year, month, 1).getDay(); // 0=일
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  const todayS = todayStr();

  // 앞쪽 흐린 셀 + 이번 달 + 뒤쪽 흐린 셀을 한 배열로 모아 한 번에 렌더
  const cells = [];

  for (let i = firstDow - 1; i >= 0; i--) {
    cells.push({
      key: 'p' + i,
      type: 'other',
      day: prevMonthDays - i,
    });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateS = `${year}-${pad(month + 1)}-${pad(day)}`;
    cells.push({
      key: dateS,
      type: 'main',
      day,
      dateS,
      dow: new Date(year, month, day).getDay(),
      records: byDate[dateS] || [],
    });
  }
  // 트레일링 빈 칸 (한 주 = 7칸)
  const trail = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trail; i++) {
    cells.push({ key: 't' + i, type: 'other', day: i });
  }

  return (
    <div className={`cal-grid ${mode}`}>
      {cells.map((cell) => {
        if (cell.type === 'other') {
          return (
            <div key={cell.key} className="cell other">
              <div className="num">{cell.day}</div>
            </div>
          );
        }
        const { dateS, day, dow, records: recs } = cell;
        const isToday = dateS === todayS;
        const isSel = dateS === selectedDate;
        const cls = ['cell'];
        if (isToday) cls.push('today');
        if (isSel) cls.push('selected');
        if (dow === 0) cls.push('sun');

        return (
          <div
            key={dateS}
            className={cls.join(' ')}
            onClick={() => onSelect(dateS)}
            role="button"
          >
            {mode === 'money' ? (
              <MoneyCellBody day={day} dow={dow} records={recs} />
            ) : (
              <WorkoutCellBody day={day} dow={dow} records={recs} workoutCats={workoutCats} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---- 셀 본문(머니) ---- */
function MoneyCellBody({ day, dow, records }) {
  const sumIn = records.filter((r) => r.kind === 'income').reduce((a, r) => a + r.amount, 0);
  const sumOut = records.filter((r) => r.kind === 'expense').reduce((a, r) => a + r.amount, 0);
  return (
    <>
      <div className="num" style={dayNumStyle(dow)}>
        {day}
      </div>
      {sumIn > 0 && <div className="amt-in">+{fmtKRWTiny(sumIn)}</div>}
      {sumOut > 0 && <div className="amt-out">-{fmtKRWTiny(sumOut)}</div>}
    </>
  );
}

/* ---- 셀 본문(운동) ---- */
function WorkoutCellBody({ day, dow, records, workoutCats }) {
  const workouts = records.filter((r) => r.kind === 'workout');
  const catIds = [...new Set(workouts.map((r) => r.categoryId))];
  const shown = catIds.slice(0, MAX_DOTS_PER_DAY);
  const overflow = catIds.length - MAX_DOTS_PER_DAY;

  return (
    <>
      <div className="num" style={dayNumStyle(dow)}>
        {day}
      </div>
      <div className="wo-dots">
        {shown.map((cid) => {
          const c = findById(workoutCats, cid);
          return (
            <div
              key={cid}
              className="wo-dot"
              style={{ background: c?.color || '#888' }}
            />
          );
        })}
        {overflow > 0 && <div className="wo-more">+{overflow}</div>}
      </div>
    </>
  );
}

/** 일/토 요일 컬러 — 일요일은 빨강, 토요일은 파랑 */
function dayNumStyle(dow) {
  if (dow === 0) return { color: 'var(--expense)' };
  if (dow === 6) return { color: 'var(--blue-2)' };
  return undefined;
}
