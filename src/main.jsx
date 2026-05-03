import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';

// 전역 스타일 — 로드 순서가 곧 cascade 우선순위
//   variables  : 색상/사이즈 토큰
//   base       : 리셋 + 레이아웃 (헤더/탭바/모달 뼈대)
//   components : 각 뷰 / 카드 컴포넌트
//   inputs     : InlineEdit / NumberStepper / QuickAmount 등 입력 보조
//   animations : 애니메이션·hover 효과 (가장 마지막 — override)
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/inputs.css';
import './styles/animations.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      Provider 중첩 순서:
      AppProvider — 비즈니스 데이터 (records, types, settings, weights)
      ToastProvider — 토스트 알림
      ModalProvider — 모달 오픈/클로즈
    */}
    <AppProvider>
      <ToastProvider>
        <ModalProvider>
          <App />
        </ModalProvider>
      </ToastProvider>
    </AppProvider>
  </React.StrictMode>
);
