/** Moving light curtains, independent of application data and page re-renders. */
const canvas = document.querySelector('#aurora-canvas');
const context = canvas?.getContext('2d', { alpha: true });
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let width = 0;
let height = 0;
let lastFrame = 0;
let animationFrame = 0;
let startedAt = performance.now();

function resize() {
  // Render softly at bounded resolution; the artwork never handles pointer input.
  const scale = Math.min(devicePixelRatio || 1, 1.25) * .72;
  width = canvas.width = Math.round(innerWidth * scale);
  height = canvas.height = Math.round(innerHeight * scale);
  paint((performance.now() - startedAt) / 1000);
}

function paint(time) {
  context.clearRect(0, 0, width, height);
  context.globalCompositeOperation = 'screen';
  const ribbons = [
    { baseline: .18, phase: 0, color: '160,87,255', amplitude: .14 },
    { baseline: .49, phase: 2.4, color: '45,219,187', amplitude: .17 },
    { baseline: .84, phase: 4.6, color: '203,79,174', amplitude: .13 },
  ];
  for (const ribbon of ribbons) {
    const gradient = context.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, `rgba(${ribbon.color},0)`);
    gradient.addColorStop(.23, `rgba(${ribbon.color},.8)`);
    gradient.addColorStop(.7, `rgba(${ribbon.color},1)`);
    gradient.addColorStop(1, `rgba(${ribbon.color},0)`);
    context.strokeStyle = gradient;
    // Translucent hanging veil above the moving edge, with uneven curtain folds.
    const veil = context.createLinearGradient(0, height * (ribbon.baseline - .3), 0, height * (ribbon.baseline + .2));
    veil.addColorStop(0, `rgba(${ribbon.color},0)`);
    veil.addColorStop(.6, `rgba(${ribbon.color},.025)`);
    veil.addColorStop(1, `rgba(${ribbon.color},.12)`);
    context.fillStyle = veil;
    context.globalAlpha = 1;
    context.beginPath();
    for (let step = 0; step <= 64; step++) {
      const progress = step / 64;
      const edge = ribbon.baseline + Math.sin(progress * 4.7 + time * .055 + ribbon.phase) * ribbon.amplitude + Math.sin(progress * 10.5 - time * .035 + ribbon.phase) * .032;
      if (!step) context.moveTo(0, edge * height); else context.lineTo(progress * width, edge * height);
    }
    for (let step = 64; step >= 0; step--) {
      const progress = step / 64;
      const edge = ribbon.baseline + Math.sin(progress * 4.7 + time * .055 + ribbon.phase) * ribbon.amplitude + Math.sin(progress * 10.5 - time * .035 + ribbon.phase) * .032;
      const folds = .16 + .04 * Math.sin(progress * 17 + ribbon.phase + time * .035);
      context.lineTo(progress * width, (edge - folds) * height);
    }
    context.closePath();context.fill();
    for (let line = 0; line < 32; line++) {
      context.beginPath();
      context.lineWidth = 1.6;
      context.globalAlpha = Math.sin(line / 32 * Math.PI) * .19;
      for (let step = 0; step <= 64; step++) {
        const x = step / 64 * width;
        const progress = x / width;
        const wave = Math.sin(progress * 4.7 + time * .055 + ribbon.phase);
        const fold = Math.sin(progress * 10.5 - time * .035 + ribbon.phase) * .032;
        const curtain = line / 32 * (.055 + .045 * Math.sin(progress * 3 + time * .04));
        const y = height * (ribbon.baseline + wave * ribbon.amplitude + fold + curtain);
        if (!step) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.stroke();
    }
    // A luminous moving edge makes the curtain visible, rather than a static color wash.
    context.beginPath();
    context.lineWidth = 1.4;
    context.globalAlpha = .32;
    context.shadowBlur = 18;
    context.shadowColor = `rgba(${ribbon.color},.8)`;
    for (let step = 0; step <= 64; step++) {
      const progress = step / 64;
      const y = height * (ribbon.baseline + Math.sin(progress * 4.7 + time * .055 + ribbon.phase) * ribbon.amplitude + Math.sin(progress * 10.5 - time * .035 + ribbon.phase) * .032);
      if (!step) context.moveTo(0, y); else context.lineTo(progress * width, y);
    }
    context.stroke();
    context.shadowBlur = 0;
  }
  context.globalAlpha = 1;
}

function frame(now) {
  animationFrame = requestAnimationFrame(frame);
  if (document.hidden || document.body.classList.contains('editor-gesture') || document.body.classList.contains('simple-material') || now - lastFrame < 1000 / 24) return;
  lastFrame = now;
  paint((now - startedAt) / 1000);
}

function start() {
  cancelAnimationFrame(animationFrame);
  resize();
  if (!reducedMotion.matches) animationFrame = requestAnimationFrame(frame);
}

if (context) {
  start();
  window.addEventListener('resize', resize, { passive: true });
  reducedMotion.addEventListener('change', start);
  window.addEventListener('pagehide', () => cancelAnimationFrame(animationFrame));
  window.addEventListener('pageshow', start);
}
