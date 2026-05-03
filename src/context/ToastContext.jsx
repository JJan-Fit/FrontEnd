import { createContext, useCallback, useContext, useRef, useState } from 'react';

/**
 * 단순 토스트 컨텍스트.
 *
 * 한 번에 하나의 토스트만 보이며, 새 메시지가 오면 기존 타이머를 갱신한다.
 * Toast 컴포넌트는 이 상태를 구독해 화면 상단에 표시한다.
 */
const ToastContext = createContext(null);

const TOAST_DURATION = 1800;

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  const toast = useCallback((msg) => {
    setMessage(String(msg));
    setVisible(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setVisible(false), TOAST_DURATION);
  }, []);

  return (
    <ToastContext.Provider value={{ message, visible, toast }}>{children}</ToastContext.Provider>
  );
}

/** 토스트 호출용 — `const toast = useToast(); toast('저장됨')` */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}

/** Toast 표시 컴포넌트 전용 — message/visible 직접 구독 */
export function useToastState() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastState must be used within ToastProvider');
  return { message: ctx.message, visible: ctx.visible };
}
