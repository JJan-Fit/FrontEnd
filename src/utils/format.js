/**
 * 통화 / 숫자 포맷 유틸
 *
 * 한국 원화(₩) 표시 전용. 음수도 부호 처리한다.
 */

/** 정확한 금액: '₩1,234,567' */
export function fmtKRW(n) {
  if (n == null) return '₩0';
  const sign = n < 0 ? '-' : '';
  return sign + '₩' + Math.abs(n).toLocaleString('ko-KR');
}

/** 짧은 형태: 1.2만 / 3.4억 등 — 차트/요약 카드용 */
export function fmtKRWShort(n) {
  if (n == null) return '₩0';
  const a = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (a >= 100_000_000)
    return sign + '₩' + (a / 100_000_000).toFixed(1).replace(/\.0$/, '') + '억';
  if (a >= 10_000) return sign + '₩' + (a / 10_000).toFixed(1).replace(/\.0$/, '') + '만';
  return sign + '₩' + a.toLocaleString('ko-KR');
}

/** 매우 짧은 형태 — 달력 셀에 들어가는 작은 라벨용 (₩기호 생략) */
export function fmtKRWTiny(n) {
  if (n == null || n === 0) return '';
  const a = Math.abs(n);
  if (a >= 10_000_000) return (a / 10_000_000).toFixed(1).replace(/\.0$/, '') + '천만';
  if (a >= 10_000)
    return (a / 10_000).toFixed(a >= 1_000_000 ? 0 : 1).replace(/\.0$/, '') + '만';
  if (a >= 1_000) return (a / 1_000).toFixed(0) + '천';
  return a.toString();
}

/** 한국식 콤마 입력용 변환 — '1234' → '1,234' */
export const toComma = (digits) =>
  digits ? Number(String(digits).replace(/[^\d]/g, '')).toLocaleString('ko-KR') : '';

/** 콤마 포함 문자열 → 정수 */
export const fromComma = (s) => Number(String(s || '').replace(/[^\d]/g, '')) || 0;
