import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  DEFAULT_EXPENSE_COLOR,
  DEFAULT_INCOME_COLOR,
} from '../../constants/defaults.js';

/**
 * 차트 색상 커스터마이저.
 * native input[type=color] 로 색상을 선택 → settings 에 즉시 반영.
 */
export default function ColorCustomizer() {
  const { state, actions } = useApp();
  const toast = useToast();

  const inC = state.settings.incomeColor || DEFAULT_INCOME_COLOR;
  const outC = state.settings.expenseColor || DEFAULT_EXPENSE_COLOR;

  const restore = () => {
    actions.updateSettings({
      incomeColor: DEFAULT_INCOME_COLOR,
      expenseColor: DEFAULT_EXPENSE_COLOR,
    });
    toast('기본 색상으로 복원됨');
  };

  return (
    <div className="set-section">
      <div className="hdr-row">
        <h2>
          <span className="em">🎨</span>차트 색상
        </h2>
      </div>

      <div>
        <ColorRow
          label="수입 그래프 색상"
          value={inC}
          onChange={(v) => actions.updateSettings({ incomeColor: v })}
        />
        <ColorRow
          label="지출 그래프 색상"
          value={outC}
          onChange={(v) => actions.updateSettings({ expenseColor: v })}
        />
        <button className="restore" onClick={restore} style={{ marginTop: 8 }}>
          기본 색상으로 복원
        </button>
      </div>
    </div>
  );
}

/* ---- 한 행 ---- */
function ColorRow({ label, value, onChange }) {
  return (
    <div className="color-row">
      <div className="nm">
        <span
          className="dot"
          style={{ background: value, width: 10, height: 10, borderRadius: '50%' }}
        />
        {label}
      </div>
      <span className="hex">{value.toUpperCase()}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
