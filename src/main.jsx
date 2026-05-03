import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ModalProvider } from './context/ModalContext.jsx';

// 전역 스타일 (변수 → 베이스 → 컴포넌트 → 애니메이션 순서로 임포트)
// 애니메이션은 마지막에 로드해 hover/transition 등 인터랙션 규칙이 우선 적용되도록 함
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
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
