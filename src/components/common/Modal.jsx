import { useEffect, useState } from 'react';
import { useModal } from '../../context/ModalContext.jsx';

/**
 * 전역 단일 모달.
 *
 * ModalContext.content 에 React 노드가 들어오면 화면 하단에서 슬라이드 업 으로 표시.
 * - 배경(어두운 영역) 클릭 시 닫힘
 * - content 가 null 이 되면 트랜지션을 위해 220ms 동안 카드 마크업을 유지한 뒤 마운트 해제
 */
export default function Modal() {
  const { content, closeModal } = useModal();
  // 마지막 content 를 보관해 사라질 때 페이드아웃이 자연스럽도록 함
  const [stickyContent, setStickyContent] = useState(content);

  useEffect(() => {
    if (content) {
      setStickyContent(content);
      return;
    }
    // 닫히는 트랜지션이 끝난 뒤 마크업을 비운다
    const t = setTimeout(() => setStickyContent(null), 220);
    return () => clearTimeout(t);
  }, [content]);

  return (
    <div className={`modal-root ${content ? 'show' : ''}`}>
      <div className="modal-back" onClick={closeModal} />
      <div className="modal-card">{stickyContent}</div>
    </div>
  );
}
