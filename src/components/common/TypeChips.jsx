import { useEffect, useRef } from 'react';

/**
 * 한 줄로 펼쳐지는 라디오 형태의 칩 목록.
 *
 * - 모달 안에서 수입/지출 종류를 고를 때 사용
 * - "+ 추가" 칩으로 새 옵션 즉시 생성
 * - 모바일에서 길게 누르거나 우클릭 → 삭제 메뉴
 *
 * @param {{
 *   items: Array<{id:string, name:string}>,
 *   selectedId: string | null,
 *   onSelect: (id: string) => void,
 *   onAdd: () => void,
 *   onDelete: (id: string) => void,
 * }} props
 */
export default function TypeChips({ items, selectedId, onSelect, onAdd, onDelete }) {
  // 길게 누르는 동안 보존되는 timer ref (각 칩별로 별도 관리할 필요는 없음 — 한 번에 한 손가락만 누른다고 가정)
  const pressTimerRef = useRef(null);

  // 안전을 위해 언마운트 시 타이머 정리
  useEffect(() => () => clearTimeout(pressTimerRef.current), []);

  const startLongPress = (id) => {
    clearTimeout(pressTimerRef.current);
    pressTimerRef.current = setTimeout(() => onDelete(id), 500);
  };
  const cancelLongPress = () => clearTimeout(pressTimerRef.current);

  return (
    <div className="type-chips">
      {items.map((t) => (
        <button
          key={t.id}
          className={`type-chip ${selectedId === t.id ? 'active' : ''}`}
          onClick={() => onSelect(t.id)}
          onTouchStart={() => startLongPress(t.id)}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onContextMenu={(e) => {
            e.preventDefault();
            onDelete(t.id);
          }}
        >
          {t.name}
        </button>
      ))}
      <button className="type-chip add-chip" onClick={onAdd}>
        + 추가
      </button>
    </div>
  );
}
