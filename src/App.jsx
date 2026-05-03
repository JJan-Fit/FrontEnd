import { useState } from 'react';
import Header from './components/layout/Header.jsx';
import TabBar from './components/layout/TabBar.jsx';
import ChartView from './components/chart/ChartView.jsx';
import CalendarView from './components/calendar/CalendarView.jsx';
import WorkoutView from './components/workout/WorkoutView.jsx';
import SettingsView from './components/settings/SettingsView.jsx';
import Modal from './components/common/Modal.jsx';
import Toast from './components/common/Toast.jsx';

/**
 * 앱 루트 — 4개의 메인 뷰(차트 / 달력 / 운동 / 설정)와 공통 UI(헤더 · 탭바 · 모달 · 토스트)를 조립.
 *
 * 활성 탭은 로컬 state로 관리. 전역 데이터는 AppContext, 모달/토스트는 각각의 Context에서 관리한다.
 */
export default function App() {
  // 현재 보이는 뷰를 식별 — 'chart' | 'cal' | 'workout' | 'set'
  const [activeView, setActiveView] = useState('chart');

  return (
    <div id="app">
      <Header />

      <main className="main">
        {/* 각 뷰는 active 클래스로 표시/숨김 — 원본 동작과 동일하게 모두 마운트해 두어 탭 전환이 빠르게 일어나도록 함 */}
        <section className={`view ${activeView === 'chart' ? 'active' : ''}`}>
          {activeView === 'chart' && <ChartView />}
        </section>
        <section className={`view ${activeView === 'cal' ? 'active' : ''}`}>
          {activeView === 'cal' && <CalendarView />}
        </section>
        <section className={`view ${activeView === 'workout' ? 'active' : ''}`}>
          {activeView === 'workout' && <WorkoutView />}
        </section>
        <section className={`view ${activeView === 'set' ? 'active' : ''}`}>
          {activeView === 'set' && <SettingsView />}
        </section>
      </main>

      <TabBar activeView={activeView} onChange={setActiveView} />

      {/* 전역 모달 / 토스트 — Provider 의 상태를 받아 항상 렌더 트리에 존재 */}
      <Modal />
      <Toast />
    </div>
  );
}
