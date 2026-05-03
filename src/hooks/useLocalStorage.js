import { useEffect, useRef, useState } from 'react';

/**
 * localStorage 와 동기화되는 useState.
 *
 * - 첫 마운트 시 저장된 값을 시도해서 읽고, 실패하거나 없으면 기본값을 사용한다.
 * - 저장된 값에 누락 키가 있을 수 있으므로 deep merge 함수를 호출자가 주입할 수 있다.
 *
 * @template T
 * @param {string} key - localStorage 키
 * @param {T} initial - 초기값
 * @param {(saved: any, fallback: T) => T} [merger] - 저장된 값 + 기본값 머지 로직
 * @returns {[T, (next: T | ((prev: T) => T)) => void]}
 */
export function useLocalStorage(key, initial, merger) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return cloneDeep(initial);
      const parsed = JSON.parse(raw);
      return merger ? merger(parsed, initial) : parsed;
    } catch {
      return cloneDeep(initial);
    }
  });

  /** 매 변경마다 저장 — 너무 잦은 쓰기를 막고 싶으면 디바운스 추가 가능 */
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // 저장 실패 (용량 초과 등) — 호출자가 토스트로 알리고 싶다면 별도 핸들러를 둘 수 있다.
      console.warn('[useLocalStorage] save failed:', e);
    }
  }, [key, value]);

  return [value, setValue];
}

/** JSON 가능한 값에 한정한 간단한 deep clone */
function cloneDeep(v) {
  return JSON.parse(JSON.stringify(v));
}
