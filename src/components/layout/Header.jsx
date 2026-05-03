import { useApp } from '../../context/AppContext.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { ICON_DATA } from '../../constants/icon.js';

/**
 * 앱 상단 헤더 — 로고, 타이틀, 다크 모드 토글.
 * 테마 값은 settings.theme 에 보관되어 새로고침 후에도 유지된다.
 */
export default function Header() {
  const { state, actions } = useApp();
  const theme = state.settings.theme || 'light';

  // theme 이 바뀌면 <html data-theme> 가 같이 갱신되도록 한다
  useTheme(theme);

  const toggleTheme = () => {
    actions.updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="hdr">
      <div className="logo">
        <img src={ICON_DATA} alt="jjan Fit" />
      </div>
      <div className="hdr-txt">
        <div className="title">짠핏</div>
        <div className="sub">jjan · fit</div>
      </div>
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title="다크 모드 전환"
        aria-label="다크 모드 전환"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </header>
  );
}
