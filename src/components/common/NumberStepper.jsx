import { forwardRef } from 'react';

/**
 * +/- 버튼이 양 옆에 붙은 숫자 입력기.
 *
 * 모바일에서 한 손으로 무게/횟수/몸무게를 바로 조정할 수 있게 한다.
 * - "꾹 누르기" 로 빠른 변동까지 지원하면 좋지만 일단 클릭 단위로 단순하게.
 * - 인풋에 직접 입력도 가능 — onChange 는 항상 string 으로 부모에게 넘기고 부모가 정수/실수로 파싱.
 *
 * @param {{
 *   value: string | number,
 *   onChange: (next: string) => void,
 *   step?: number,
 *   min?: number,
 *   max?: number,
 *   placeholder?: string,
 *   inputMode?: 'numeric' | 'decimal',
 *   className?: string,
 *   onEnter?: () => void,        // Enter 입력 시 호출 (다음 인풋으로 이동 등에 사용)
 *   ariaLabel?: string,
 * }} props
 */
const NumberStepper = forwardRef(function NumberStepper(
  {
    value,
    onChange,
    step = 1,
    min,
    max,
    placeholder = '0',
    inputMode = 'numeric',
    className = '',
    onEnter,
    ariaLabel,
  },
  ref
) {
  const numeric = (() => {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
  })();

  const clamp = (n) => {
    if (typeof min === 'number' && n < min) return min;
    if (typeof max === 'number' && n > max) return max;
    // 부동소수점 누적 오차 방지 — step 이 0.5 일 때 72.4999... 같은 값 방지
    return Math.round(n * 1000) / 1000;
  };

  const bump = (delta) => {
    const next = clamp(numeric + delta);
    // step 이 정수면 정수 문자열, 아니면 소수점 한 자리까지
    onChange(Number.isInteger(step) ? String(next) : next.toFixed(1));
  };

  return (
    <div className={`stepper ${className}`}>
      <button
        type="button"
        className="stepper-btn"
        onClick={() => bump(-step)}
        aria-label={`${ariaLabel || ''} 감소`}
        tabIndex={-1}
      >
        −
      </button>
      <input
        ref={ref}
        type="number"
        inputMode={inputMode}
        step={step}
        min={min}
        max={max}
        value={value}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
      />
      <button
        type="button"
        className="stepper-btn"
        onClick={() => bump(step)}
        aria-label={`${ariaLabel || ''} 증가`}
        tabIndex={-1}
      >
        +
      </button>
    </div>
  );
});

export default NumberStepper;
