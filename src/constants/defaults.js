/**
 * 앱 기본 상태 / 색상 상수
 *
 * 이 파일은 "초기 데이터 형상" 의 단일 출처(SoT) 역할을 한다.
 * - 새 사용자 첫 진입 시 시드 데이터
 * - 데이터 초기화(reset) 시 복원 데이터
 * - 마이그레이션 시 누락 키 보완용 디폴트
 */

/** localStorage 키 — 버전 변경 시 v3, v4 등으로 올린다 */
export const STORAGE_KEY = 'jjanfit.v2';

/** 수입/지출 그래프의 기본 색상 (사용자가 변경 가능) */
export const DEFAULT_INCOME_COLOR = '#4A7FB8';
export const DEFAULT_EXPENSE_COLOR = '#E14B6A';

/** 운동 카테고리 추가 시 자동 배정되는 컬러 팔레트 */
export const WORKOUT_PALETTE = [
  '#C7B3E8',
  '#9FE4C4',
  '#F4B8D6',
  '#FFCBA4',
  '#FFB4B4',
  '#A3C9E8',
  '#FFD88B',
];

/** 차트에서 사용할 기간 옵션 (일 단위) */
export const PERIOD_OPTIONS = [
  { label: '1주', days: 7 },
  { label: '1개월', days: 30 },
  { label: '3개월', days: 90 },
  { label: '1년', days: 365 },
];

/** 요일 라벨 (일~토) */
export const DOW_KOR = ['일', '월', '화', '수', '목', '금', '토'];

/**
 * 앱 초기 상태 (DEFAULT_STATE)
 * - records : 모든 기록 (income/expense/workout 통합 저장)
 * - weights : { 'YYYY-MM-DD': number } 형태의 일자별 몸무게
 */
export const DEFAULT_STATE = {
  incomeTypes: [
    { id: 'it_1', name: '용돈' },
    { id: 'it_2', name: '월급' },
  ],
  expenseTypes: [
    { id: 'et_1', name: '식비' },
    { id: 'et_2', name: '교통비' },
    { id: 'et_3', name: '쇼핑' },
    { id: 'et_4', name: '카페' },
  ],
  workoutCats: [
    {
      id: 'wc_1',
      name: '가슴',
      color: '#FFB4B4',
      exercises: [
        { id: 'ex_1', name: '벤치프레스' },
        { id: 'ex_2', name: '덤벨 프레스' },
      ],
    },
    {
      id: 'wc_2',
      name: '등',
      color: '#A3C9E8',
      exercises: [
        { id: 'ex_3', name: '데드리프트' },
        { id: 'ex_4', name: '턱걸이' },
      ],
    },
    {
      id: 'wc_3',
      name: '하체',
      color: '#FFD88B',
      exercises: [
        { id: 'ex_5', name: '스쿼트' },
        { id: 'ex_6', name: '런지' },
      ],
    },
  ],
  records: [],
  weights: {},
  settings: {
    incomeColor: DEFAULT_INCOME_COLOR,
    expenseColor: DEFAULT_EXPENSE_COLOR,
    theme: 'light', // 'light' | 'dark'
  },
};
