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
        {/*
          탭 전환 시 부드러운 페이드 업 애니메이션을 매번 재생하기 위해
          활성 뷰만 단일 <section> 으로 마운트한다 (key 변경 → 애니메이션 재시작).
          비활성 뷰의 상태는 보존되지 않지만, 탭 전환은 충분히 빠르고
          데이터 자체는 AppContext 에 있어 데이터 손실은 없다.
        */}
        <section key={activeView} className="view active">
          {activeView === 'chart' && <ChartView />}
          {activeView === 'cal' && <CalendarView />}
          {activeView === 'workout' && <WorkoutView />}
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
