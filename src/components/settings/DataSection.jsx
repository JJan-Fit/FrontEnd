import { useMemo } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * 데이터 통계 + 전체 초기화 버튼.
 * 저장소 사용량은 JSON 직렬화 길이로 근사 계산한다.
 */
export default function DataSection() {
  const { state, actions } = useApp();
  const toast = useToast();

  const sizeKB = useMemo(() => {
    try {
      const size = new Blob([JSON.stringify(state)]).size;
      return (size / 1024).toFixed(1);
    } catch {
      return '0.0';
    }
  }, [state]);

  const reset = () => {
    if (!confirm('모든 데이터가 영구 삭제됩니다. 계속할까요?')) return;
    if (!confirm('정말 모든 수입·지출·운동 기록을 지울까요?')) return;
    actions.resetAll();
    toast('초기화 완료');
  };

  return (
    <div className="set-section">
      <div className="hdr-row">
        <h2>
          <span className="em">🗂</span>데이터
        </h2>
      </div>

      <div className="list">
        <div className="item">
          <div className="nm">총 기록</div>
          <div
            className="muted"
            style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700 }}
          >
            {state.records.length.toLocaleString()}건
          </div>
        </div>
        <div className="item">
          <div className="nm">저장소 사용량</div>
          <div
            className="muted"
            style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, fontWeight: 700 }}
          >
            {sizeKB} KB
          </div>
        </div>
      </div>

      <button className="danger-btn" onClick={reset}>
        모든 데이터 초기화
      </button>

      <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 11, marginTop: 16 }}>
        짠핏 · made with ❤️ · v2.0
      </div>
    </div>
  );
}
