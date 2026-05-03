/**
 * 돋보기 아이콘 + 클리어 버튼이 달린 검색 인풋.
 *
 * @param {{
 *   value: string,
 *   onChange: (v: string) => void,
 *   placeholder?: string,
 *   autoFocus?: boolean,
 * }} props
 */
export default function SearchInput({ value, onChange, placeholder, autoFocus = false }) {
  return (
    <div className="search-row">
      <input
        type="text"
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        className={`clearBtn ${value ? 'show' : ''}`}
        onClick={() => onChange('')}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
