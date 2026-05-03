# 짠핏 (jjan Fit) — FrontEnd

수입/지출 가계부 + 운동/몸무게 트래커가 결합된 모바일 친화 SPA.
원본 단일 HTML(`jjanfit.html`) 을 React 컴포넌트 구조로 리팩토링한 결과물.

## 빠른 시작

```powershell
# 1) 의존성 설치
npm install

# 2) 개발 서버 실행 (기본 포트 5173)
npm run dev

# 3) 프로덕션 빌드
npm run build
npm run preview
```

> Node.js 18 이상을 권장합니다.

## 프로젝트 구조

```
FrontEnd/
├── index.html              ─ Vite 진입 HTML (root + main.jsx)
├── jjanfit.html            ─ 원본 단일 HTML (참조용으로 유지)
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx            ─ ReactDOM 마운트 + Provider 트리
    ├── App.jsx             ─ 헤더 / 4개 메인 뷰 / 탭바 / 모달 / 토스트
    │
    ├── styles/             ─ CSS 분리 (테마 변수 → 베이스 → 컴포넌트)
    │   ├── variables.css
    │   ├── base.css
    │   └── components.css
    │
    ├── constants/
    │   ├── defaults.js     ─ DEFAULT_STATE, 색상 팔레트, 기간 옵션
    │   └── icon.js         ─ 로고 base64 (외부 자원 의존 X)
    │
    ├── utils/
    │   ├── date.js         ─ pad / fmtDate / todayStr 등
    │   ├── format.js       ─ fmtKRW / fmtKRWShort / fmtKRWTiny
    │   ├── id.js           ─ uid / findById
    │   └── chart.js        ─ smoothPath / scaleX / scaleY
    │
    ├── hooks/
    │   ├── useLocalStorage.js  ─ localStorage 동기화 useState
    │   └── useTheme.js         ─ <html data-theme="..."> 반영
    │
    ├── context/
    │   ├── AppContext.jsx      ─ 전역 데이터 + 액션 (records / types / weights / settings)
    │   ├── ToastContext.jsx    ─ 토스트 메시지
    │   └── ModalContext.jsx    ─ 단일 모달 오픈/클로즈
    │
    └── components/
        ├── common/                  공통 재사용 컴포넌트
        │   ├── Modal.jsx            ─ 전역 단일 모달
        │   ├── Toast.jsx            ─ 상단 토스트
        │   ├── EmptyState.jsx       ─ 빈 상태 안내
        │   ├── SectionTitle.jsx     ─ 섹션 헤더
        │   ├── SearchInput.jsx      ─ 검색창 + 클리어 버튼
        │   ├── TypeChips.jsx        ─ 라디오형 칩 + 길게 눌러 삭제
        │   └── TransactionRow.jsx   ─ 수입/지출/운동 통합 행
        │
        ├── layout/
        │   ├── Header.jsx           ─ 로고 + 다크모드 토글
        │   └── TabBar.jsx           ─ 하단 탭바
        │
        ├── chart/                   📈 차트 뷰
        │   ├── ChartView.jsx
        │   ├── SummaryGrid.jsx      ─ 수입/지출/잔액 3분할
        │   ├── PeriodSelector.jsx   ─ 1주/1개월/3개월/1년
        │   ├── BalanceChart.jsx     ─ 듀얼 라인 + 거래량 막대 SVG
        │   ├── ChartSelectedInfo.jsx ─ 점 클릭 시 핀 고정 정보
        │   └── RecentList.jsx       ─ 최근 10건
        │
        ├── calendar/                📅 달력 뷰
        │   ├── CalendarView.jsx
        │   ├── CalendarModeSwitch.jsx  ─ 머니 / 운동 모드
        │   ├── CalendarTopCard.jsx     ─ 월간 요약 + 전월 비교
        │   ├── CalendarGrid.jsx        ─ 셀 그리드 (모드별 다른 본문)
        │   └── DayPanel.jsx            ─ 선택된 날짜 상세
        │
        ├── workout/                 💪 운동 뷰
        │   ├── WorkoutView.jsx
        │   ├── WorkoutHero.jsx         ─ 오늘의 총 세트
        │   ├── WeightCard.jsx          ─ 몸무게 트래커
        │   ├── WeightChart.jsx         ─ 몸무게 라인 차트
        │   ├── CategoryChips.jsx       ─ 카테고리 선택 칩
        │   ├── ExerciseGrid.jsx        ─ 종목 카드 그리드
        │   └── SessionList.jsx         ─ 오늘 세션 목록
        │
        ├── settings/                ⚙️ 설정 뷰
        │   ├── SettingsView.jsx
        │   ├── TypeListSection.jsx     ─ 수입/지출 종류 (재사용 가능)
        │   ├── WorkoutCatList.jsx      ─ 카테고리/종목 트리
        │   ├── ColorCustomizer.jsx     ─ 차트 색 변경
        │   └── DataSection.jsx         ─ 통계 + 전체 초기화
        │
        └── modals/                  하단 슬라이드 모달
            ├── MoneyModal.jsx          ─ 수입/지출 추가·수정
            ├── WorkoutPicker.jsx       ─ 운동 종목 고르기 (검색)
            └── SessionModal.jsx        ─ 세트 입력
```

## 데이터 흐름

```
                 +---------------------+
                 |   AppProvider       |
                 |  (localStorage v2)  |
                 +---------------------+
                  | state | actions
                  v       v
+-----------+   +-----------+   +-----------+   +-----------+
|  ChartView|   |CalendarView|  | WorkoutView|  |SettingsView|
+-----------+   +-----------+   +-----------+   +-----------+
                  |
                  v
        +-------------------+
        | ModalContext      |  <-- MoneyModal / WorkoutPicker / SessionModal
        +-------------------+
        | ToastContext      |  <-- 모든 컴포넌트에서 useToast()
        +-------------------+
```

- 데이터는 `localStorage` 키 `jjanfit.v2` 에 통째로 저장된다.
- 모든 변경은 `actions.*` 메서드를 통해서만 일어나도록 한다 (변경 지점을 한 곳으로 모음).
- 모달은 `useModal().openModal(<Component .../>)` 한 번 호출로 띄울 수 있다.

## 핵심 컴포넌트 책임 분리

| 책임            | 컴포넌트/모듈                                  |
| -------------- | ---------------------------------------------- |
| 영속화          | `useLocalStorage` + `AppProvider`               |
| 테마(다크/라이트)| `useTheme` + `Header`                          |
| 차트 SVG        | `BalanceChart`, `WeightChart` (utils/chart.js) |
| 달력 셀         | `CalendarGrid` (모드별 본문 분기)                |
| 모달 폼         | `modals/*` (각 모달이 자체 검증/저장 책임)       |

신규 기능을 추가할 때는 보통 다음 순서로 작업한다.

1. `constants/defaults.js` 에 새 데이터 형상 추가
2. `AppContext` 에 그 데이터를 다루는 action 추가
3. 표시용 컴포넌트 작성 (필요 시 `components/common/` 의 재사용 컴포넌트 활용)
4. 적절한 뷰 (`chart/cal/workout/set` 중 하나) 또는 모달에 끼워 넣기
