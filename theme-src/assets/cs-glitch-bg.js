/* Cool Story — animated glitch background
 * Vanilla WebGL fragment shader. No deps. GPU-side only.
 * Usage: add data-cs-glitch-bg to any <canvas> inside a positioned container.
 * Optional data-cs-glitch-dark="true" for dark/hero variant.
 */
if (!window.__csGlitchBgLoaded) {
  window.__csGlitchBgLoaded = true;

  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  /* ------------------------------------------------------------------ */
  /* Fragment shader — Cool Story brand palette (pink / violet / purple) */
  /* ------------------------------------------------------------------ */
  const FRAG = `
    precision mediump float;
    uniform float u_t;
    uniform vec2  u_res;
    uniform float u_dark;   /* 0 = bright strip, 1 = dark hero */

    /* Brand palette */
    const vec3 HOT_PINK    = vec3(0.973, 0.376, 0.753); /* #F860C0 */
    const vec3 ORCHID      = vec3(0.973, 0.471, 0.941); /* #F878F0 */
    const vec3 VIOLET_SOFT = vec3(0.533, 0.314, 0.973); /* #8850F8 */
    const vec3 VIOLET      = vec3(0.345, 0.063, 0.910); /* #5810E8 */
    const vec3 DEEP        = vec3(0.282, 0.157, 0.502); /* #482880 */
    const vec3 PERIW       = vec3(0.314, 0.345, 0.973); /* #5058F8 */

    /* ---- hash / noise ---- */
    float h1(float n)  { return fract(sin(n) * 43758.5453); }
    float h2(vec2  p)  { return fract(sin(dot(p, vec2(12.9898, 4.1414))) * 43758.5453); }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f*f*(3.0-2.0*f);
      return mix(mix(h2(i), h2(i+vec2(1,0)), f.x),
                 mix(h2(i+vec2(0,1)), h2(i+vec2(1,1)), f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) { v += a*noise(p); p *= 2.1; a *= 0.5; }
      return v;
    }

    /* ---- brand palette interpolation ---- */
    vec3 pal(float t) {
      t = fract(t + 0.001);
      if (t < 0.2)  return mix(HOT_PINK,    ORCHID,      t * 5.0);
      if (t < 0.4)  return mix(ORCHID,      VIOLET_SOFT, (t-0.2)*5.0);
      if (t < 0.6)  return mix(VIOLET_SOFT, PERIW,       (t-0.4)*5.0);
      if (t < 0.8)  return mix(PERIW,       VIOLET,      (t-0.6)*5.0);
      return              mix(VIOLET,       DEEP,        (t-0.8)*5.0);
    }

    /* ---- glitch pulse: fires ~every 5s for ~0.25s ---- */
    float glitchStrength(float t) {
      float cycle   = 5.0;
      float phase   = mod(t, cycle);
      float trigger = step(cycle - 0.25, phase);
      /* second shorter burst offset */
      float phase2  = mod(t + 2.3, cycle);
      float trig2   = step(cycle - 0.12, phase2) * 0.5;
      return trigger + trig2;
    }

    /* ---- plasma value at UV ---- */
    float plasma(vec2 uv, float t) {
      float n = 0.0;
      n += 0.45 * sin(uv.x * 2.4  + t * 0.38);
      n += 0.45 * sin(uv.y * 1.7  - t * 0.27);
      n += 0.35 * sin((uv.x+uv.y) * 1.9 + t * 0.22);
      n += 0.30 * sin(uv.x * 4.3  - uv.y * 2.6 + t * 0.55);
      n += 0.55 * fbm(uv * 2.8 + vec2(t*0.11, t*0.07));
      return n / 2.1 + 0.5;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float t  = u_t;

      /* --- glitch: band-based horizontal displacement --- */
      float gs   = glitchStrength(t);
      float rows = 32.0;
      float row  = floor(uv.y * rows);
      float seed = h1(row + floor(t * 10.0) * 137.0);
      float disp = (seed - 0.5) * 0.11 * gs;
      /* a few rows get a bigger kick */
      disp += step(0.88, seed) * 0.18 * gs;

      vec2 guv = vec2(fract(uv.x + disp), uv.y);

      /* --- chromatic aberration during glitch --- */
      float ca  = gs * 0.018;
      vec2 uvR  = vec2(fract(uv.x + disp + ca), uv.y);
      vec2 uvB  = vec2(fract(uv.x + disp - ca), uv.y);

      /* --- plasma field --- */
      float pC = plasma(guv, t);
      float pR = plasma(uvR,  t);
      float pB = plasma(uvB,  t);

      /* --- breathing (slow amplitude pulse) --- */
      float breath = 0.88 + 0.12 * sin(t * 0.65);
      pC *= breath;

      /* --- slow palette drift --- */
      float drift = t * 0.035;

      vec3 colC = pal(pC + drift);
      vec3 colR = pal(pR + drift);
      vec3 colB = pal(pB + drift);

      /* apply chromatic split */
      vec3 col = mix(colC, vec3(colR.r, colC.g, colB.b), gs * 0.75);

      /* --- dark-mode: pull low-plasma areas toward deep purple / black --- */
      float darkness = mix(0.0, 1.0, u_dark);
      vec3  base     = mix(HOT_PINK * 0.55, DEEP * 0.25, darkness);
      col = mix(base, col, smoothstep(0.08, 0.45, pC));

      /* overall brightness */
      col = mix(col * 0.65, col, mix(1.0, 0.85, darkness));

      /* --- subtle scanlines (1px every 2px, 10% dimmer) --- */
      col *= 1.0 - 0.10 * mod(gl_FragCoord.y, 2.0);

      /* --- vignette --- */
      vec2 vig = uv * (1.0 - uv);
      col = mix(col * 0.45, col, pow(clamp(vig.x*vig.y*18.0, 0.0, 1.0), 0.22));

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  /* ------------------------------------------------------------------ */

  class CsGlitchBg {
    constructor(canvas) {
      this.canvas   = canvas;
      this.isDark   = canvas.dataset.csGlitchDark === 'true';
      this.running  = false;
      this.raf      = null;
      this.t0       = performance.now();

      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return; // graceful no-op
      this.gl = gl;

      if (!this._build()) return;

      this._obs = new ResizeObserver(() => this._resize());
      this._obs.observe(canvas.parentElement);
      this._resize();

      this.running = true;
      this._tick();
    }

    _build() {
      const gl = this.gl;
      const vert = this._shader(gl.VERTEX_SHADER,   VERT);
      const frag = this._shader(gl.FRAGMENT_SHADER, FRAG);
      if (!vert || !frag) return false;

      const prog = gl.createProgram();
      gl.attachShader(prog, vert); gl.attachShader(prog, frag);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn('[cs-glitch-bg] link:', gl.getProgramInfoLog(prog));
        return false;
      }
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'a_pos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      this.uT    = gl.getUniformLocation(prog, 'u_t');
      this.uRes  = gl.getUniformLocation(prog, 'u_res');
      this.uDark = gl.getUniformLocation(prog, 'u_dark');
      return true;
    }

    _shader(type, src) {
      const gl = this.gl;
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn('[cs-glitch-bg] compile:', gl.getShaderInfoLog(sh));
        return null;
      }
      return sh;
    }

    _resize() {
      const p = this.canvas.parentElement;
      const w = p.offsetWidth, h = p.offsetHeight;
      /* Render at 50% resolution — upscaled by CSS for that chunky pixel look */
      this.canvas.width  = Math.max(1, Math.round(w * 0.5));
      this.canvas.height = Math.max(1, Math.round(h * 0.5));
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    _tick() {
      if (!this.running) return;
      const t = (performance.now() - this.t0) / 1000;
      this.gl.uniform1f(this.uT, t);
      this.gl.uniform2f(this.uRes, this.canvas.width, this.canvas.height);
      this.gl.uniform1f(this.uDark, this.isDark ? 1.0 : 0.0);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      this.raf = requestAnimationFrame(() => this._tick());
    }

    destroy() {
      this.running = false;
      cancelAnimationFrame(this.raf);
      this._obs?.disconnect();
    }
  }

  /* Auto-init — respects prefers-reduced-motion */
  function init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('[data-cs-glitch-bg]').forEach(c => new CsGlitchBg(c));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
