/**
 * 짧은 고유 ID 생성기.
 * 충돌 가능성은 매우 낮지만 분산 환경이 아니므로 단순한 random 으로 충분.
 *
 * @param {string} prefix - 'r_', 'it_', 'wc_' 등 종류 구분 prefix
 */
export const uid = (prefix = '') => prefix + Math.random().toString(36).slice(2, 10);

/** 컬렉션에서 id 로 항목 찾기 */
export const findById = (arr, id) => (Array.isArray(arr) ? arr.find((x) => x.id === id) : null);
