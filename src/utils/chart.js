/**
 * 차트(SVG) 헬퍼 — 좌표 변환과 부드러운 곡선 path 생성
 *
 * 화면 영역(View Box)은 컴포넌트별로 고정된 비율을 사용한다 (preserveAspectRatio="none"
 * 으로 가로만 늘려서 표시).
 */

/**
 * 점 배열을 받아 베지어 곡선 d 속성 문자열로 변환.
 * 두 점 사이의 중간 X 좌표를 양쪽 컨트롤 포인트로 잡아 자연스러운 S 자 흐름을 만든다.
 *
 * @param {[number, number][]} pts
 * @returns {string} SVG path d 속성
 */
export function smoothPath(pts) {
  if (!pts.length) return '';
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1];
    const p1 = pts[i];
    const mx = (p0[0] + p1[0]) / 2;
    d += ` C ${mx} ${p0[1]}, ${mx} ${p1[1]}, ${p1[0]} ${p1[1]}`;
  }
  return d;
}

/**
 * 데이터 인덱스 → x 픽셀 좌표.
 * 한 점만 있으면 가로 가운데, 그 외엔 균등 분포.
 */
export const scaleX = (i, total, width, padL, padR) =>
  padL + (width - padL - padR) * (total === 1 ? 0.5 : i / (total - 1));

/**
 * 값 → y 픽셀 좌표 (위가 큰 값 = 차트 윗부분).
 */
export const scaleY = (v, yMin, yMax, height, padT, padB) =>
  padT + (height - padT - padB) * (1 - (v - yMin) / (yMax - yMin));
