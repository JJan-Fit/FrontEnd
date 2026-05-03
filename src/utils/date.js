/**
 * 날짜 포맷/파싱 유틸 모음
 *
 * 앱 전체에서 날짜는 'YYYY-MM-DD' 문자열로 다룬다 (정렬·비교가 자연스럽기 때문에).
 * Date 객체는 가급적 이 모듈 안에서만 사용한다.
 */

/** 한 자리 숫자에 0 패딩 — '5' → '05' */
export const pad = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' 문자열을 Date 로 변환 (로컬 타임 기준) */
export const toDate = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Date → 'YYYY-MM-DD' */
export const fmtDate = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Date → 'HH:mm' */
export const fmtTime = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** 오늘 날짜를 'YYYY-MM-DD' 로 반환 */
export const todayStr = () => fmtDate(new Date());

/** 'YYYY-MM-DD' 의 day-of-week (0:일 ~ 6:토) */
export const dayOfWeek = (s) => toDate(s).getDay();
