/**
 * 하단 탭바 (모바일 네비게이션).
 *
 * 한 곳에서 모든 탭 정의를 관리하므로 탭 추가/제거가 쉽다.
 *
 * @param {{ activeView: string, onChange: (v: string) => void }} props
 */
const TABS = [
  { id: 'chart', icon: '📈', label: '차트' },
  { id: 'cal', icon: '📅', label: '달력' },
  { id: 'workout', icon: '💪', label: '운동' },
  { id: 'set', icon: '⚙️', label: '설정' },
];

export default function TabBar({ activeView, onChange }) {
  return (
    <nav className="tabbar">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeView === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="ic">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
