import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { todayStr } from '../../utils/date.js';
import WeightChart from './WeightChart.jsx';

/**
 * 오늘의 몸무게를 입력하고, 일자별 트렌드를 보여주는 카드.
 *
 * weights 는 { 'YYYY-MM-DD': kg } 형태. 같은 날짜를 다시 저장하면 덮어쓴다.
 */
export default function WeightCard() {
  const { state, actions } = useApp();
  const toast = useToast();
  const [inputValue, setInputValue] = useState('');

  const weights = state.weights || {};

  // 날짜 오름차순 정렬 (문자열 비교가 곧 날짜 비교)
  const keys = useMemo(() => Object.keys(weights).sort(), [weights]);
  const pts = useMemo(() => keys.map((k) => ({ date: k, v: weights[k] })), [keys, weights]);

  const todayS = todayStr();
  const latestKey = keys[keys.length - 1];
  const latestV = latestKey ? weights[latestKey] : null;
  const prevKey = keys[keys.length - 2];
  const prevV = prevKey ? weights[prevKey] : null;

  /* ---------- 저장 ---------- */
  const handleSave = () => {
    const v = parseFloat(inputValue);
    if (!v || v <= 0 || v > 500) {
      toast('올바른 몸무게를 입력하세요');
      return;
    }
    actions.setWeight(todayS, v);
    toast(`오늘 몸무게 ${v}kg 저장`);
    setInputValue('');
  };

  /* ---------- 우상단 표시 (최신값 + 변동) ---------- */
  let statBlock;
  if (latestV != null) {
    let deltaBlock = null;
    if (prevV != null) {
      const d = latestV - prevV;
      if (d > 0) deltaBlock = <div className="delta up">▲ {d.toFixed(1)}kg</div>;
      else if (d < 0)
        deltaBlock = <div className="delta down">▼ {Math.abs(d).toFixed(1)}kg</div>;
      else deltaBlock = <div className="delta" style={{ color: 'var(--ink-3)' }}>— 변동 없음</div>;
    }
    const [, mm, dd] = latestKey.split('-');
    statBlock = (
      <>
        <div className="lbl">{latestKey === todayS ? '오늘' : `${mm}.${dd}`}</div>
        <div className="val">{latestV.toFixed(1)} kg</div>
        {deltaBlock}
      </>
    );
  } else {
    statBlock = (
      <>
        <div className="lbl">아직 기록 없음</div>
        <div className="val" style={{ color: 'var(--ink-3)', fontSize: 13 }}>
          — kg
        </div>
      </>
    );
  }

  /* ---------- 차트 양쪽 끝 날짜 라벨 ---------- */
  let dateLabels = null;
  if (pts.length >= 2) {
    const [ay, am, ad] = pts[0].date.split('-');
    const [by, bm, bd] = pts[pts.length - 1].date.split('-');
    dateLabels = (
      <div className="weight-date-labels">
        <span>
          {ay}.{am}.{ad}
        </span>
        <span>
          {by}.{bm}.{bd}
        </span>
      </div>
    );
  } else if (pts.length === 1) {
    const [yy, mm, dd] = pts[0].date.split('-');
    dateLabels = (
      <div className="weight-date-labels">
        <span>
          {yy}.{mm}.{dd}
        </span>
        <span />
      </div>
    );
  }

  return (
    <div className="card weight-card">
      <div className="top">
        <h2>
          <span className="em">⚖️</span>오늘의 몸무게
        </h2>
        <div className="stat-now">{statBlock}</div>
      </div>

      <div className="input-row">
        <input
          type="number"
          step="0.1"
          inputMode="decimal"
          placeholder="예: 72.5"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        <div className="unit">kg</div>
        <button onClick={handleSave}>저장</button>
      </div>

      <WeightChart pts={pts} />
      {dateLabels}
    </div>
  );
}
