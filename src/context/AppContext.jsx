import { createContext, useCallback, useContext, useMemo } from 'react';
import { DEFAULT_STATE, STORAGE_KEY } from '../constants/defaults.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { uid } from '../utils/id.js';

/**
 * 앱 전역 데이터 스토어.
 *
 * 단일 객체 state 안에 다음을 보관한다.
 *   - records      : 모든 기록 (income / expense / workout)
 *   - incomeTypes  : 수입 종류 목록
 *   - expenseTypes : 지출 종류 목록
 *   - workoutCats  : 운동 카테고리(+ 하위 종목)
 *   - weights      : { 'YYYY-MM-DD': kg } 일자별 몸무게
 *   - settings     : 색상 / 테마 등 사용자 설정
 *
 * 모든 변경은 actions 객체의 메서드를 통해 일어나도록 한다 (직접 setState 노출 X).
 * 이렇게 하면 변경 지점을 한 곳에 모을 수 있어 추적이 쉽다.
 */
const AppContext = createContext(null);

/** 저장된 값과 기본값을 머지 — 새 키가 추가되어도 기존 사용자가 깨지지 않도록 */
function mergeState(saved, fallback) {
  const merged = { ...fallback, ...saved };
  merged.settings = { ...fallback.settings, ...(saved?.settings || {}) };
  merged.weights = { ...(saved?.weights || {}) };
  return merged;
}

export function AppProvider({ children }) {
  const [state, setState] = useLocalStorage(STORAGE_KEY, DEFAULT_STATE, mergeState);

  /* ---------- records (수입/지출/운동) ---------- */

  /** 새 기록 추가 — id 는 자동 생성. payload 의 kind 가 'income'|'expense'|'workout' 중 하나여야 함 */
  const addRecord = useCallback(
    (rec) => {
      setState((s) => ({
        ...s,
        records: [...s.records, { id: uid('r_'), ...rec }],
      }));
    },
    [setState]
  );

  const updateRecord = useCallback(
    (id, patch) => {
      setState((s) => ({
        ...s,
        records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
    },
    [setState]
  );

  const deleteRecord = useCallback(
    (id) => {
      setState((s) => ({ ...s, records: s.records.filter((r) => r.id !== id) }));
    },
    [setState]
  );

  /* ---------- 수입/지출 종류 ---------- */

  /** key 는 'incomeTypes' | 'expenseTypes' */
  const addType = useCallback(
    (key, name) => {
      setState((s) => ({
        ...s,
        [key]: [...s[key], { id: uid(key === 'incomeTypes' ? 'it_' : 'et_'), name }],
      }));
    },
    [setState]
  );

  const renameType = useCallback(
    (key, id, name) => {
      setState((s) => ({
        ...s,
        [key]: s[key].map((t) => (t.id === id ? { ...t, name } : t)),
      }));
    },
    [setState]
  );

  const deleteType = useCallback(
    (key, id) => {
      setState((s) => ({ ...s, [key]: s[key].filter((t) => t.id !== id) }));
    },
    [setState]
  );

  /* ---------- 운동 카테고리 / 종목 ---------- */

  const addWorkoutCat = useCallback(
    (name, color) => {
      setState((s) => ({
        ...s,
        workoutCats: [...s.workoutCats, { id: uid('wc_'), name, color, exercises: [] }],
      }));
    },
    [setState]
  );

  const renameWorkoutCat = useCallback(
    (catId, name) => {
      setState((s) => ({
        ...s,
        workoutCats: s.workoutCats.map((c) => (c.id === catId ? { ...c, name } : c)),
      }));
    },
    [setState]
  );

  const deleteWorkoutCat = useCallback(
    (catId) => {
      setState((s) => ({
        ...s,
        workoutCats: s.workoutCats.filter((c) => c.id !== catId),
      }));
    },
    [setState]
  );

  const addExercise = useCallback(
    (catId, name) => {
      setState((s) => ({
        ...s,
        workoutCats: s.workoutCats.map((c) =>
          c.id === catId
            ? { ...c, exercises: [...c.exercises, { id: uid('ex_'), name }] }
            : c
        ),
      }));
    },
    [setState]
  );

  const renameExercise = useCallback(
    (catId, exId, name) => {
      setState((s) => ({
        ...s,
        workoutCats: s.workoutCats.map((c) =>
          c.id === catId
            ? { ...c, exercises: c.exercises.map((e) => (e.id === exId ? { ...e, name } : e)) }
            : c
        ),
      }));
    },
    [setState]
  );

  const deleteExercise = useCallback(
    (catId, exId) => {
      setState((s) => ({
        ...s,
        workoutCats: s.workoutCats.map((c) =>
          c.id === catId ? { ...c, exercises: c.exercises.filter((e) => e.id !== exId) } : c
        ),
      }));
    },
    [setState]
  );

  /* ---------- 몸무게 ---------- */

  const setWeight = useCallback(
    (dateStr, value) => {
      setState((s) => ({ ...s, weights: { ...s.weights, [dateStr]: value } }));
    },
    [setState]
  );

  /* ---------- 설정 ---------- */

  const updateSettings = useCallback(
    (patch) => {
      setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    },
    [setState]
  );

  /* ---------- 전체 초기화 ---------- */

  const resetAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(JSON.parse(JSON.stringify(DEFAULT_STATE)));
  }, [setState]);

  /* ---------- actions 메모이제이션 ---------- */

  const actions = useMemo(
    () => ({
      addRecord,
      updateRecord,
      deleteRecord,
      addType,
      renameType,
      deleteType,
      addWorkoutCat,
      renameWorkoutCat,
      deleteWorkoutCat,
      addExercise,
      renameExercise,
      deleteExercise,
      setWeight,
      updateSettings,
      resetAll,
    }),
    [
      addRecord,
      updateRecord,
      deleteRecord,
      addType,
      renameType,
      deleteType,
      addWorkoutCat,
      renameWorkoutCat,
      deleteWorkoutCat,
      addExercise,
      renameExercise,
      deleteExercise,
      setWeight,
      updateSettings,
      resetAll,
    ]
  );

  return <AppContext.Provider value={{ state, actions }}>{children}</AppContext.Provider>;
}

/** 컴포넌트에서 `const { state, actions } = useApp();` 으로 사용 */
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
