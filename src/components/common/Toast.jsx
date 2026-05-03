import { useToastState } from '../../context/ToastContext.jsx';

/**
 * 화면 상단 토스트.
 * ToastContext 의 visible 이 true 인 동안 .show 클래스가 붙어 슬라이드 인.
 */
export default function Toast() {
  const { message, visible } = useToastState();
  return <div className={`toast ${visible ? 'show' : ''}`}>{message}</div>;
}
