import { useEffect } from 'react';

/**
 * 'light' | 'dark' 테마를 <html data-theme="..."> 에 반영한다.
 * CSS 측은 :root 변수 + html[data-theme="dark"] 오버라이드로 색상을 전환한다.
 */
export function useTheme(theme) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme || 'light';
  }, [theme]);
}
