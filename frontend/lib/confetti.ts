// A small hand-rolled confetti burst — no canvas-confetti or similar
// dependency (this environment's npm install is broken; this is also
// consistent with the project's existing preference for hand-rolled
// interactions over pulling in libraries, e.g. the drag/tilt/edge-color
// work in ProductAdBanner/Product3DCard). Pure DOM + CSS transitions, no
// canvas, no animation loop — each piece is a <span> whose transform is set
// once and left to the browser's own transition timing.
const COLORS = ["#ff8a00", "#ff9500", "#120a1e", "#ffffff", "#ffd76a"];
const PIECE_COUNT = 26;
const LIFETIME_MS = 1000;

export function fireConfetti(origin: { x: number; y: number }): void {
  if (typeof document === "undefined") return;

  const container = document.createElement("div");
  container.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2000;overflow:hidden;";
  document.body.appendChild(container);

  for (let i = 0; i < PIECE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 90;
    const dx = Math.cos(angle) * distance;
    // Biased upward on launch (negative dy), then a fixed downward offset
    // added on top mimics gravity pulling each piece back down as it fades.
    const dy = Math.sin(angle) * distance - 40 + 160;
    const rotate = Math.round(Math.random() * 720 - 360);
    const width = 5 + Math.random() * 5;
    const color = COLORS[i % COLORS.length];

    const piece = document.createElement("span");
    piece.style.cssText = `
      position: absolute;
      left: ${origin.x}px;
      top: ${origin.y}px;
      width: ${width}px;
      height: ${width * 0.4}px;
      background: ${color};
      border-radius: 1px;
      opacity: 1;
      transform: translate(0, 0) rotate(0deg);
      transition: transform ${LIFETIME_MS}ms cubic-bezier(0.2, 0.8, 0.3, 1), opacity ${LIFETIME_MS}ms ease;
    `;
    container.appendChild(piece);

    // Set on the next frame so the browser registers the "from" state
    // above before the "to" state below, or the transition never plays.
    requestAnimationFrame(() => {
      piece.style.transform = `translate(${dx}px, ${dy}px) rotate(${rotate}deg)`;
      piece.style.opacity = "0";
    });
  }

  window.setTimeout(() => container.remove(), LIFETIME_MS + 50);
}
