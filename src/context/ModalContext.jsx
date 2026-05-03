import { createContext, useCallback, useContext, useState } from 'react';

/**
 * 모달 컨텍스트.
 *
 * - openModal(node) : 임의의 React 노드를 모달로 띄움
 * - closeModal()    : 닫기
 *
 * 모달 본체는 <Modal /> 컴포넌트가 렌더링하며, 이 컨텍스트의 content 를 자식으로 표시한다.
 */
const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [content, setContent] = useState(null);

  const openModal = useCallback((node) => setContent(node), []);
  const closeModal = useCallback(() => setContent(null), []);

  return (
    <ModalContext.Provider value={{ content, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used within ModalProvider');
  return ctx;
}
