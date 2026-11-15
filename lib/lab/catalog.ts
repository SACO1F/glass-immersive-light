export type LabSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LabComparisonRow = {
  dimension: string;
  css: string;
  svg: string;
  webgl: string;
};

export type LabArticle = {
  slug: string;
  order: string;
  eyebrow: string;
  title: string;
  summary: string;
  conclusion: string;
  topics: string[];
  sections: LabSection[];
  comparison: LabComparisonRow[];
  failures: string[];
  takeaways: string[];
  componentSlug: string;
};

const articles: LabArticle[] = [
  {
    slug: "rim-light",
    order: "01",
    eyebrow: "Edge Study",
    title: "边缘高光：从一条白线到可追踪的光源",
    summary:
      "边缘高光不是 1px 白色描边。它需要方向、厚度和衰减，否则只会变成另一种边框。",
    conclusion:
      "默认用 CSS 渐变描边 + 指针接近度驱动透明度；指针在组件外也应生效。SVG 与 WebGL 不负责基础边缘。",
    topics: ["CSS mask", "指针接近度", "T1/T2/T3"],
    sections: [
      {
        heading: "先决定边缘是什么",
        paragraphs: [
          "玻璃边缘的高光来自反射，不是描边。它通常只出现在朝向光源的一段，并且亮度会随视角变化。",
          "实现上用 1px 的 mask 描边承载一个径向渐变，渐变中心就是指针位置。指针离开后，描边回到透明，而不是保留一条静态亮线。",
        ],
        bullets: [
          "渐变描边：padding 1px + mask-composite: exclude",
          "指针位置：window pointermove，相对组件坐标，可为负值",
          "接近度：0–1，按到矩形边缘的距离衰减",
        ],
      },
      {
        heading: "为什么必须支持组件外光源",
        paragraphs: [
          "只在 hover 时点亮，会让边缘光变成悬停态装饰。把指针当作场景光源，光线应该在指针进入组件前就开始进入边缘。",
          "我们使用 260–320px 的接近范围；越近越亮，进入内部后保留更高强度的镜面高光。",
        ],
      },
      {
        heading: "什么时候不该用 SVG",
        paragraphs: [
          "SVG 位移适合做局部形变，不适合承担所有组件的边缘光。大面积 turbulence 会持续消耗 CPU，而且很难在不同内容上保持一致。",
        ],
      },
    ],
    comparison: [
      {
        dimension: "方向性",
        css: "径向渐变可跟随指针",
        svg: "可做扰动，但方向控制更绕",
        webgl: "完全可控，成本最高",
      },
      {
        dimension: "性能",
        css: "低，单层 mask",
        svg: "中，面积敏感",
        webgl: "高，仅 T1",
      },
      {
        dimension: "降级",
        css: "直接移除描边",
        svg: "移除 filter",
        webgl: "回退 CSS 描边",
      },
    ],
    failures: [
      "静态渐变描边：看起来像普通边框，指针离开后仍然发光。",
      "动画 backdrop-filter：昂贵且容易触发整层重绘。",
      "在滚动容器上放大面积模糊：移动端掉帧明显。",
    ],
    takeaways: [
      "边缘高光由指针接近度驱动，而不是 hover。",
      "T3 直接移除指针光效，保留静态表面。",
      "组件页的 Fidelity / GPU / Fallback 必须和 Lab 结论一致。",
    ],
    componentSlug: "rim-light",
  },
  {
    slug: "blur-refraction",
    order: "02",
    eyebrow: "Refraction Study",
    title: "模糊折射：backdrop-filter 能做什么，不能做什么",
    summary:
      "backdrop-filter 可以模糊和调色，但它不会真正弯折背景。把这一点说清楚，比假装能还原更重要。",
    conclusion:
      "CSS 玻璃是基本盘；SVG 位移只对可控背景可靠；WebGL 无法直接采样 DOM 背景，不能承诺任意页面折射。",
    topics: ["backdrop-filter", "saturate", "可控背景"],
    sections: [
      {
        heading: "backdrop-filter 的边界",
        paragraphs: [
          "backdrop-filter 读取的是元素背后的渲染结果，能做 blur、saturate、brightness，但不能做几何位移。",
          "所以它能做出“磨砂玻璃”，但不能让背景在玻璃下真正弯曲。真正的折射需要位移贴图，而 Web 端没有稳定的任意 DOM 背景采样能力。",
        ],
        bullets: [
          "blur：磨砂感，成本低",
          "saturate：让颜色更接近玻璃后的观感",
          "inset shadow：提供厚度，不改变背景几何",
        ],
      },
      {
        heading: "为什么保留 blur-only 降级",
        paragraphs: [
          "不是所有设备都能承受多层 backdrop-filter。移动端通常把 blur 压到 10px 以下，并禁止嵌套玻璃容器。",
          "降级后的不透明面板并不“失败”，它是明确的可访问性选择。",
        ],
      },
      {
        heading: "SVG 位移适合什么",
        paragraphs: [
          "当背景是组件内可控的图片或渐变时，feDisplacementMap 可以做出可信的折射。它可以精确控制位移强度、噪声频率和边缘裁切。",
          "一旦背景变成任意页面内容，方案就会变成 DOM-to-texture，成本和稳定性都不可接受。",
        ],
      },
    ],
    comparison: [
      {
        dimension: "背景几何",
        css: "不改变",
        svg: "可控背景内可位移",
        webgl: "可控背景内可位移",
      },
      {
        dimension: "任意 DOM 背景",
        css: "可模糊",
        svg: "不可靠",
        webgl: "不能直接采样",
      },
      {
        dimension: "性能",
        css: "中，按面积增长",
        svg: "中高，面积敏感",
        webgl: "高，需分层降级",
      },
    ],
    failures: [
      "把 backdrop-filter 当成真实折射：视觉上缺少边缘弯曲。",
      "多层玻璃嵌套：每层都在采样背景，移动端迅速掉帧。",
      "对任意页面背景使用 SVG 位移：需要 DOM 截图，稳定性和隐私都不可接受。",
    ],
    takeaways: [
      "先做可信的模糊玻璃，再考虑局部位移。",
      "位移只发生在组件内可控背景上。",
      "降级不是妥协，是产品承诺的一部分。",
    ],
    componentSlug: "blur-refraction",
  },
  {
    slug: "chromatic-edge",
    order: "03",
    eyebrow: "Dispersion Study",
    title: "色散边缘：小面积 SVG 扰动的可控做法",
    summary:
      "色散不是一圈彩虹边框。它需要很窄的色差、轻微的几何扰动，以及不逐帧重算噪声。",
    conclusion:
      "用 SVG feTurbulence + feDisplacementMap 只扰动 2px 描边；turbulence 静态生成，指针只改变透明度。",
    topics: ["feTurbulence", "feDisplacementMap", "静态噪声"],
    sections: [
      {
        heading: "色散不是彩虹边框",
        paragraphs: [
          "真实镜头的色散是不同波长在边缘产生微小位移。用三色边框模拟会显得像装饰，而不是光学现象。",
          "更可信的做法是让描边本身有轻微几何扰动，再用粉、白、青的窄渐变提供色差。",
        ],
      },
      {
        heading: "为什么只扰动描边",
        paragraphs: [
          "SVG filter 的成本和面积相关。只作用于 1–2px 的描边，比作用于整张卡片便宜得多，也更容易保持文字清晰。",
          "文字层永远不进入 filter。焦点环、按钮和正文都保持在未扰动层。",
        ],
        bullets: [
          "baseFrequency 约 0.012–0.02",
          "numOctaves 1，scale 约 5",
          "filter 区域限制在描边附近",
        ],
      },
      {
        heading: "静态噪声，动态透明度",
        paragraphs: [
          "不要每帧重新生成 turbulence。噪声静态生成，指针只改变 opacity；这样既有响应，又不会持续消耗 CPU。",
          "如果确实需要更强的动态感，用两档 filter 交叉淡入，而不是逐帧改 seed。",
        ],
      },
    ],
    comparison: [
      {
        dimension: "色差可信度",
        css: "低，容易像彩虹边框",
        svg: "中高，描边扰动更自然",
        webgl: "高，可做通道偏移",
      },
      {
        dimension: "成本",
        css: "低",
        svg: "中，面积小",
        webgl: "高",
      },
      {
        dimension: "文字安全",
        css: "安全",
        svg: "需把文字放在 filter 外",
        webgl: "需分层渲染",
      },
    ],
    failures: [
      "整张卡片套 filter：文字被扰动，性能下降。",
      "逐帧 feTurbulence：CPU 占用高，效果也不稳定。",
      "用三条纯色边框模拟色散：看起来像霓虹灯，不像玻璃。",
    ],
    takeaways: [
      "色散只在边缘，不在整个表面。",
      "噪声静态生成，指针只改变透明度。",
      "T3 直接移除 SVG，保留静态表面。",
    ],
    componentSlug: "chromatic-edge",
  },
];

export function getAllLabArticles(): LabArticle[] {
  return articles;
}

export function getLabArticle(slug: string): LabArticle | undefined {
  return articles.find((article) => article.slug === slug);
}
