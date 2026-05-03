import { useEffect, useRef, useState } from 'react';

/**
 * 클릭 한 번으로 그 자리에서 텍스트를 편집할 수 있게 해주는 컴포넌트.
 *
 * 기존엔 `prompt()` 로 이름을 받아왔는데 — 모바일·데스크톱 모두 거슬리고 디자인도 깨졌다.
 * 편집 모드일 때만 인풋을 그리고, blur / Enter 시 저장 / Esc 시 취소.
 *
 * @param {{
 *   value: string,
 *   onSave: (next: string) => void,
 *   placeholder?: string,
 *   className?: string,
 *   inputStyle?: React.CSSProperties,
 *   editing: boolean,             // 외부에서 제어 — 편집 시작/종료를 부모가 결정
 *   onEditingChange: (b: boolean) => void,
 *   maxLength?: number,
 * }} props
 */
export default function InlineEdit({
  value,
  onSave,
  placeholder = '',
  className = '',
  inputStyle,
  editing,
  onEditingChange,
  maxLength = 30,
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  // 편집 시작 시 현재 값을 draft 에 복사하고 input 에 포커스 + 전체 선택
  useEffect(() => {
    if (editing) {
      setDraft(value);
      // 다음 페인트 후 포커스 — 즉시 호출하면 모바일 키보드가 잘 안 뜸
      requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
    }
  }, [editing, value]);

  const commit = () => {
    const v = draft.trim();
    if (v && v !== value) onSave(v);
    onEditingChange(false);
  };
  const cancel = () => {
    setDraft(value);
    onEditingChange(false);
  };

  if (!editing) {
    return <span className={className}>{value}</span>;
  }

  return (
    <input
      ref={inputRef}
      className={`inline-edit-input ${className}`}
      style={inputStyle}
      value={draft}
      placeholder={placeholder}
      maxLength={maxLength}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancel();
        }
      }}
    />
  );
}
