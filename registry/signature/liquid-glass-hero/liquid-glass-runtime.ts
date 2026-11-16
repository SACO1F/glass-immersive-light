/*
 * Liquid glass WebGL runtime (skeleton).
 *
 * This module is intentionally React-free so it can be copied with a
 * component and reused by a future WebGL flagship. The runtime renders a
 * controlled scene texture; it cannot sample arbitrary DOM content.
 *
 * The caller must keep a CSS base visible and remove or hide the canvas when
 * onFallback fires. This runtime never replaces the CSS fallback contract.
 */

export type Rgb = [number, number, number];

export type LiquidGlassTheme = "dark" | "light";

export type LiquidGlassBackend = "webgl2" | "webgl1";

export type LiquidGlassRuntimeOptions = {
  canvas: HTMLCanvasElement;
  scene?: TexImageSource | null;
  theme?: LiquidGlassTheme;
  radius?: number;
  refraction?: number;
  dispersion?: number;
  fresnel?: number;
  tint?: Rgb;
  tintStrength?: number;
  fresnelColor?: Rgb;
  onFallback?: (reason: string) => void;
};

export type LiquidGlassRuntimeUpdate = Partial<
  Pick<
    LiquidGlassRuntimeOptions,
    | "theme"
    | "radius"
    | "refraction"
    | "dispersion"
    | "fresnel"
    | "tint"
    | "tintStrength"
    | "fresnelColor"
  >
>;

export type LiquidGlassRuntime = {
  readonly backend: LiquidGlassBackend;
  resize: () => void;
  render: () => void;
  setScene: (scene: TexImageSource | null) => void;
  setTheme: (theme: LiquidGlassTheme) => void;
  setPointer: (x: number, y: number) => void;
  setOptions: (options: LiquidGlassRuntimeUpdate) => void;
  destroy: () => void;
};

const MAX_DPR = 1.5;
const MAX_TEXTURE_SIZE = 2048;

const defaultOptions: Required<
  Pick<
    LiquidGlassRuntimeOptions,
    | "theme"
    | "radius"
    | "refraction"
    | "dispersion"
    | "fresnel"
    | "tint"
    | "tintStrength"
    | "fresnelColor"
  >
> = {
  theme: "dark",
  radius: 28,
  refraction: 0.35,
  dispersion: 0,
  fresnel: 0.7,
  tint: [0.78, 0.9, 1],
  tintStrength: 0.08,
  fresnelColor: [0.72, 0.95, 1],
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function numberOr(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) ? (value as number) : fallback;
}

function buildShaderSources(webgl2: boolean): {
  vertex: string;
  fragment: string;
} {
  const vertex = webgl2
    ? `#version 300 es
in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`
    : `attribute vec2 aPosition;
varying vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

  const sample = webgl2 ? "texture" : "texture2D";
  const output = webgl2 ? "fragColor" : "gl_FragColor";
  const precision = webgl2
    ? "precision highp float;"
    : `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif`;

  const header = webgl2
    ? `#version 300 es
${precision}
in vec2 vUv;
out vec4 fragColor;`
    : `${precision}
varying vec2 vUv;`;

  const uniforms = `
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uRefraction;
uniform float uDispersion;
uniform float uFresnel;
uniform vec3 uTint;
uniform float uTintStrength;
uniform vec3 uFresnelColor;`;

  const main = `
float sdRoundRect(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

void main() {
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * uResolution;
  vec2 halfSize = 0.5 * uResolution - 1.5;
  float radius = min(uRadius, min(halfSize.x, halfSize.y));
  float d = sdRoundRect(p, halfSize, radius);

  // Finite differences keep the WebGL1 path free of derivative extensions.
  float e = 1.5 / max(uResolution.y, 1.0);
  float dx = sdRoundRect(p + vec2(e, 0.0), halfSize, radius)
           - sdRoundRect(p - vec2(e, 0.0), halfSize, radius);
  float dy = sdRoundRect(p + vec2(0.0, e), halfSize, radius)
           - sdRoundRect(p - vec2(0.0, e), halfSize, radius);
  vec2 grad = normalize(vec2(dx, dy) + 1e-6);

  float bevel = 1.0 - smoothstep(-8.0, 0.0, d);
  vec3 normal = normalize(vec3(grad * bevel * 1.6, 1.0));
  float fresnel = pow(1.0 - max(normal.z, 0.0), 3.0);

  // Smooth radial lens: strongest around the rim, stable at the very border.
  // The border fade avoids sampling outside the scene texture, which would
  // otherwise clamp and create a notch at the rounded edge.
  vec2 q = (uv - 0.5) * 2.0;
  float r2 = clamp(dot(q, q), 0.0, 1.0);
  vec2 lens = -q * (0.45 + 0.55 * (1.0 - 0.55 * r2));
  float borderFade = smoothstep(0.0, 14.0, -d);
  vec2 offset = lens * uRefraction * 0.03 * borderFade;

  vec2 direction = normalize(offset + 1e-6);
  float spread = uDispersion * 0.006;

  vec3 color;
  if (uDispersion > 0.001) {
    color.r = ${sample}(uScene, clamp(uv + offset + direction * spread, 0.0, 1.0)).r;
    color.g = ${sample}(uScene, clamp(uv + offset, 0.0, 1.0)).g;
    color.b = ${sample}(uScene, clamp(uv + offset - direction * spread, 0.0, 1.0)).b;
  } else {
    color = ${sample}(uScene, clamp(uv + offset, 0.0, 1.0)).rgb;
  }

  vec2 lightDirection = normalize(uPointer - uv + vec2(1e-6));
  float side = 0.5 + 0.5 * dot(grad, lightDirection);
  float rim = fresnel * (0.35 + 0.65 * side);

  color = mix(color, uTint, uTintStrength * (0.65 + 0.35 * fresnel));
  color += uFresnelColor * rim * uFresnel * 0.55;

  ${output} = vec4(color, 1.0);
}`;

  return {
    vertex,
    fragment: `${header}${uniforms}${main}`,
  };
}

function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  webgl2: boolean,
): WebGLProgram | null {
  const sources = buildShaderSources(webgl2);
  const vertex = compileShader(gl, gl.VERTEX_SHADER, sources.vertex);
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, sources.fragment);

  if (!vertex || !fragment) {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return null;
  }

  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  return program;
}

/**
 * Built-in high-contrast scene for demos and fallback CSS backgrounds.
 * It intentionally has no text so refraction never makes content unreadable.
 */
export function createTestScene(
  width: number,
  height: number,
  theme: LiquidGlassTheme,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  const scale = Math.min(
    1,
    MAX_TEXTURE_SIZE / Math.max(1, width, height),
  );
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const w = canvas.width;
  const h = canvas.height;
  const dark = theme === "dark";

  const background = context.createLinearGradient(0, 0, w, h);
  background.addColorStop(0, dark ? "#071019" : "#eef4f7");
  background.addColorStop(0.55, dark ? "#0b1420" : "#f7fafc");
  background.addColorStop(1, dark ? "#101a28" : "#e6eff4");
  context.fillStyle = background;
  context.fillRect(0, 0, w, h);

  // Grid.
  context.lineWidth = 1;
  context.strokeStyle = dark
    ? "rgba(143, 216, 255, 0.28)"
    : "rgba(0, 92, 122, 0.26)";
  const step = Math.max(28, Math.round(Math.min(w, h) / 14));
  for (let x = step; x < w; x += step) {
    context.beginPath();
    context.moveTo(x + 0.5, 0);
    context.lineTo(x + 0.5, h);
    context.stroke();
  }
  for (let y = step; y < h; y += step) {
    context.beginPath();
    context.moveTo(0, y + 0.5);
    context.lineTo(w, y + 0.5);
    context.stroke();
  }

  // Checker tiles make the UV displacement readable without adding text.
  const tile = Math.max(36, Math.round(Math.min(w, h) / 9));
  context.fillStyle = dark
    ? "rgba(255, 255, 255, 0.035)"
    : "rgba(10, 22, 32, 0.035)";
  for (let y = 0; y < h; y += tile) {
    for (let x = 0; x < w; x += tile) {
      if ((Math.floor(x / tile) + Math.floor(y / tile)) % 2 === 0) {
        context.fillRect(x, y, tile, tile);
      }
    }
  }

  // Spectral bars make channel separation visible.
  const bars = [
    { color: "#6fe7ff", x: 0.18, width: 0.055 },
    { color: "#8b7bff", x: 0.3, width: 0.035 },
    { color: "#ff6f9c", x: 0.68, width: 0.05 },
    { color: "#ffd08a", x: 0.79, width: 0.03 },
  ];
  for (const bar of bars) {
    context.fillStyle = bar.color;
    context.globalAlpha = dark ? 0.7 : 0.55;
    context.fillRect(bar.x * w, 0, bar.width * w, h);
  }
  context.globalAlpha = 1;

  // High-contrast rings and a center line.
  context.strokeStyle = dark ? "rgba(255,255,255,0.82)" : "rgba(5,20,30,0.7)";
  context.lineWidth = Math.max(1, Math.round(Math.min(w, h) / 320));
  context.beginPath();
  context.arc(w * 0.5, h * 0.5, Math.min(w, h) * 0.2, 0, Math.PI * 2);
  context.stroke();
  context.beginPath();
  context.moveTo(0, h * 0.5);
  context.lineTo(w, h * 0.5);
  context.stroke();

  return canvas;
}

export function createLiquidGlassRuntime(
  options: LiquidGlassRuntimeOptions,
): LiquidGlassRuntime | null {
  const { canvas } = options;
  const attributes: WebGLContextAttributes = {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  };

  let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
  let webgl2 = false;

  try {
    gl = canvas.getContext("webgl2", attributes);
    if (gl) {
      webgl2 = true;
    } else {
      gl = canvas.getContext("webgl", attributes);
    }
  } catch {
    gl = null;
  }

  if (!gl) {
    options.onFallback?.("context-unavailable");
    return null;
  }

  const program = createProgram(gl, webgl2);
  if (!program) {
    options.onFallback?.("shader-compile");
    return null;
  }

  const buffer = gl.createBuffer();
  const texture = gl.createTexture();

  if (!buffer || !texture) {
    gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
    if (texture) gl.deleteTexture(texture);
    options.onFallback?.("resource-allocation");
    return null;
  }

  const getUniform = (name: string) => gl?.getUniformLocation(program, name) ?? null;
  const uniforms = {
    scene: getUniform("uScene"),
    resolution: getUniform("uResolution"),
    pointer: getUniform("uPointer"),
    radius: getUniform("uRadius"),
    refraction: getUniform("uRefraction"),
    dispersion: getUniform("uDispersion"),
    fresnel: getUniform("uFresnel"),
    tint: getUniform("uTint"),
    tintStrength: getUniform("uTintStrength"),
    fresnelColor: getUniform("uFresnelColor"),
  };

  const state = {
    theme: options.theme ?? defaultOptions.theme,
    radius: numberOr(options.radius, defaultOptions.radius),
    refraction: clamp(
      numberOr(options.refraction, defaultOptions.refraction),
      0,
      1,
    ),
    dispersion: clamp(
      numberOr(options.dispersion, defaultOptions.dispersion),
      0,
      1,
    ),
    fresnel: clamp(numberOr(options.fresnel, defaultOptions.fresnel), 0, 1),
    tint: options.tint ?? defaultOptions.tint,
    tintStrength: clamp(
      numberOr(options.tintStrength, defaultOptions.tintStrength),
      0,
      1,
    ),
    fresnelColor: options.fresnelColor ?? defaultOptions.fresnelColor,
    pointerX: 0.5,
    pointerY: 0.5,
  };

  let externalScene: TexImageSource | null = options.scene ?? null;
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let disposed = false;
  let contextLost = false;

  const scheduleRender = () => {
    if (disposed || contextLost || frame !== 0) return;

    frame = window.requestAnimationFrame(() => {
      frame = 0;
      render();
    });
  };

  const uploadScene = (source: TexImageSource): boolean => {
    if (!gl || disposed || contextLost) return false;

    try {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      return true;
    } catch {
      return false;
    }
  };

  const buildDefaultScene = () => {
    const scene = createTestScene(
      Math.max(1, width),
      Math.max(1, height),
      state.theme,
    );
    uploadScene(scene);
  };

  const render = () => {
    if (disposed || contextLost || !gl || width <= 0 || height <= 0) return;

    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    if (uniforms.scene) gl.uniform1i(uniforms.scene, 0);
    if (uniforms.resolution) gl.uniform2f(uniforms.resolution, width, height);
    if (uniforms.pointer) {
      gl.uniform2f(uniforms.pointer, state.pointerX, state.pointerY);
    }
    if (uniforms.radius) {
      gl.uniform1f(
        uniforms.radius,
        Math.min(state.radius * dpr, Math.min(width, height) / 2),
      );
    }
    if (uniforms.refraction) {
      gl.uniform1f(uniforms.refraction, state.refraction);
    }
    if (uniforms.dispersion) {
      gl.uniform1f(uniforms.dispersion, state.dispersion);
    }
    if (uniforms.fresnel) gl.uniform1f(uniforms.fresnel, state.fresnel);
    if (uniforms.tint) {
      gl.uniform3f(uniforms.tint, state.tint[0], state.tint[1], state.tint[2]);
    }
    if (uniforms.tintStrength) {
      gl.uniform1f(uniforms.tintStrength, state.tintStrength);
    }
    if (uniforms.fresnelColor) {
      gl.uniform3f(
        uniforms.fresnelColor,
        state.fresnelColor[0],
        state.fresnelColor[1],
        state.fresnelColor[2],
      );
    }

    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const resize = () => {
    if (disposed || contextLost) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const nextWidth = Math.max(1, Math.round(rect.width * dpr));
    const nextHeight = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      width = nextWidth;
      height = nextHeight;
      gl?.viewport(0, 0, width, height);

      if (!externalScene) buildDefaultScene();
    } else {
      width = nextWidth;
      height = nextHeight;
    }

    render();
  };

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    contextLost = true;
    if (frame !== 0) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
    options.onFallback?.("context-lost");
  };

  canvas.addEventListener("webglcontextlost", handleContextLost, false);

  gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW,
  );
  const position = gl.getAttribLocation(program, "aPosition");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  resize();

  const runtime: LiquidGlassRuntime = {
    backend: webgl2 ? "webgl2" : "webgl1",
    resize,
    render,
    setScene: (scene) => {
      if (disposed || contextLost) return;
      externalScene = scene;
      if (scene) {
        if (!uploadScene(scene)) {
          options.onFallback?.("scene-texture");
          return;
        }
      } else {
        buildDefaultScene();
      }
      scheduleRender();
    },
    setTheme: (theme) => {
      if (disposed || contextLost) return;
      state.theme = theme;
      if (!externalScene) buildDefaultScene();
      scheduleRender();
    },
    setPointer: (x, y) => {
      state.pointerX = clamp(Number.isFinite(x) ? x : 0.5, 0, 1);
      state.pointerY = clamp(Number.isFinite(y) ? y : 0.5, 0, 1);
      scheduleRender();
    },
    setOptions: (update) => {
      if (update.theme && update.theme !== state.theme) {
        state.theme = update.theme;
        if (!externalScene) buildDefaultScene();
      }
      if (update.radius !== undefined) {
        state.radius = Math.max(0, numberOr(update.radius, state.radius));
      }
      if (update.refraction !== undefined) {
        state.refraction = clamp(
          numberOr(update.refraction, state.refraction),
          0,
          1,
        );
      }
      if (update.dispersion !== undefined) {
        state.dispersion = clamp(
          numberOr(update.dispersion, state.dispersion),
          0,
          1,
        );
      }
      if (update.fresnel !== undefined) {
        state.fresnel = clamp(numberOr(update.fresnel, state.fresnel), 0, 1);
      }
      if (update.tint) state.tint = update.tint;
      if (update.tintStrength !== undefined) {
        state.tintStrength = clamp(
          numberOr(update.tintStrength, state.tintStrength),
          0,
          1,
        );
      }
      if (update.fresnelColor) state.fresnelColor = update.fresnelColor;
      scheduleRender();
    },
    destroy: () => {
      if (disposed) return;
      disposed = true;
      if (frame !== 0) window.cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost", handleContextLost, false);
      gl.deleteBuffer(buffer);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    },
  };

  return runtime;
}
