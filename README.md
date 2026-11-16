# ImmersiveLight

以物理光学为灵感、复制即用、按设备自动降级的 React 光感动效组件库。

站点同时提供组件文档、代码复制与 Optical Lab 实验笔记。组件源码位于 `registry/`，不依赖 Tailwind，也不依赖站点内部路径别名。

> 独立设计项目，不隶属于华为或苹果，不宣称兼容或还原 HarmonyOS 沉浸光感、Apple Liquid Glass 或任何平台。

## 目标用户

- **React / Next.js 开发者**：需要可直接复制、无运行时依赖的玻璃与光效组件。
- **设计工程师**：需要在真实界面里调档位、主题和材质，而不是只看静态稿。
- **原型与小团队**：需要快速搭建有质感的界面，同时保留明确的性能降级路径。

成功指标（当前为定性目标，待发布后量化）：

- 从打开组件页到完成接入不超过 5 分钟。
- 复制三个文件后无需修改 import 即可通过 TypeScript 编译。
- 每个组件页都有 Props、降级矩阵、可访问性说明与最小示例。
- 每次目标环境验收都能追溯到浏览器/设备、日期与测试条件。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 生产构建
npm run start      # 启动生产构建
npm run typecheck
npm run lint
npm run check:copy # 空项目类型编译夹具
npm run test:behavior # 生产构建 + 浏览器行为回归
npm run test:browsers # Firefox / WebKit 跨引擎冒烟
```

## 组件结构

| 层 | 目录 | 组件 |
| --- | --- | --- |
| 光学原语 | `registry/optical/` | RimLight、InnerShade、BlurRefraction、ChromaticEdge、AmbientLight |
| 场景组件 | `registry/scene/` | OpticalNavbar、FluidGlassDock、RefractiveCard、SheenButton、ImmersiveModal |
| 原创特色 | `registry/signature/` | CursorRefractionCard、MagneticSheenButton、FocusPulseForm、LiquidLightPool、RipplePool、GlassHero |

每个组件目录包含：

- `index.tsx`：组件实现
- `styles.css`：普通 CSS + CSS 变量
- `use-optical-tier.ts`：档位解析与最小能力探测
- `meta.ts`：站点元数据、Props、降级矩阵、材质支持与可访问性说明
- `demo.tsx`：站点预览

复制全部会得到前三个文件；请保持它们在同一目录，`./use-optical-tier` 的导入才能成立。GlassHero 额外包含 `liquid-glass-runtime.ts`，复制时请保留四个文件。

## 双材质

组件库覆盖两个光学维度：

| material | 叙事 | 当前实现 |
| --- | --- | --- |
| `immersive-light` | 光落在表面 | 环境光、边缘高光、内阴影、指针高光 |
| `liquid-glass` | 光穿过介质 | CSS 基座 + GlassHero WebGL 折射/色散 |

`material` 与 `theme`、`tier` 正交：`theme` 控制深浅色，`tier` 控制质量与降级，`material` 控制物理机制与图层结构。默认材质仍是 `immersive-light`，不改变已有组件行为。

目前 `RefractiveCard` 已支持 `material="liquid-glass"` 的 CSS 基座；`GlassHero` 提供 WebGL2/WebGL1 后端，对组件自带场景做折射与可选色散。CSS 基座没有真实背景位移或色散，WebGL 也不采样页面 DOM。深色与浅色模式都使用 cool tinted glass：深色为 cyan/indigo，浅色为 pale cyan/lavender，不依赖内部加亮。材质解析在 `use-optical-tier.ts` 中。

## 档位契约

解析顺序：

1. 显式 `tier` prop
2. 最近的 `[data-tier]` 祖先
3. 本机能力探测（`navigator` + `matchMedia` + WebGL2）

最终档位会写到组件根节点的 `data-il-tier`，CSS 与 WebGL 使用同一结果。站点预览中的 T1 / T2 / T3 会覆盖全局档位。

| 档位 | 条件 | 行为 |
| --- | --- | --- |
| T1 | 桌面、WebGL2、高性能 | 完整 WebGL / SVG / 多层玻璃 |
| T2 | 移动、中端、粗指针 | CSS 玻璃，backdrop blur ≤ 10px，无 WebGL |
| T3 | 低端、saveData、减少透明度 | 不透明表面、静态边缘、无指针光效 |

`prefers-reduced-motion` 不是档位：它单独停止指针光源、视差、磁性位移、扩散动画与 WebGL 光池，并在运行中切换时立即生效。

## 已验证范围

- Chromium（Edge / Chrome）桌面无头浏览器
- Firefox 159（Playwright 构建，无头）
- WebKit 27.2（Playwright Windows 构建，无头；不等同 Safari 真机）
- 390×844 / DPR 3 / 触摸模拟
- 16 个组件的复制文件集合与独立 TypeScript 编译；组件页实际挂载
- 空项目 TypeScript 编译夹具
- WebGL 上下文、着色器、链接与 context lost 回退
- `liquid-glass` CSS 基座的材质切换、深浅色与档位上限（Firefox / WebKit 无头覆盖）
- GlassHero：WebGL2、WebGL1、CSS 回退、深浅色 tinted glass 与色散开关（Chromium 无头）

尚未验证：

- Safari 真机与 iOS WebKit
- iOS / Android 真机
- 屏幕阅读器与完整键盘焦点陷阱
- 全站对比度与文字碰撞
- GPU 帧率、功耗、温升与光学保真度基准

组件页的 Fidelity / GPU 徽章是开发期预估，不是基准测试结果。

## 路线图

| 阶段 | 状态 | 内容 |
| --- | --- | --- |
| P0 | 已完成 | 7 个 CSS 组件、复制链路、主题与档位 |
| P1 | 已完成 | 场景组件、SVG 边缘、浅色模式 |
| P2 | 已完成 | LiquidLightPool、RipplePool、Optical Lab、Docs、SEO、Legal、搜索筛选、缩略图、变体控制、CI |
| 双材质 | 进行中 | material API、CSS 基座、GlassHero WebGL 旗舰；更多材质变体与 WebGPU 待接入 |
| 发布验收 | 进行中 | 跨浏览器、真机性能、无障碍与行为回归 |
| 发布后 | 计划 | Showcase、Live Playground、Registry 自动化、多引擎/真机基准 |

阶段验收标准：

| 阶段 | 可测验收 |
| --- | --- |
| P0 | 页面全部返回 200；复制内容与源码一致；typecheck / lint / build / check:copy 通过 |
| P1 | 16 个组件可独立挂载；36 组档位组合通过；深色与浅色变体有实际材质差异 |
| P2 | WebGL 四级回退通过；搜索与三层筛选准确；行为回归脚本在 CI 中通过 |
| 双材质 | 默认材质不变；material 切换通过；CSS 基座明确标注无真实折射 |
| 发布 | 目标浏览器与真机矩阵、性能预算、无障碍记录齐全，未验证项明确列出 |

## 风险与关闭条件

| 风险 | 影响 | 当前缓解 | 关闭条件 |
| --- | --- | --- | --- |
| 移动端 blur 成本 | 掉帧、发热 | T2 上限 10px；T3 禁用 backdrop-filter | 真机帧率与功耗记录 |
| WebGL 上下文丢失 | 光池空白 | getContext / shader / link / context lost 四级回退 | Safari 与移动真机回退验证 |
| 档位语义漂移 | 预览与生产不一致 | 统一 `data-il-tier` 最近作用域 | 36 组合自动化回归 |
| 减少动态遗漏 | 无障碍回归 | CSS 媒体查询 + matchMedia 订阅 | 运行中切换测试纳入 CI |
| 复制后缺依赖 | 用户接入失败 | `check:copy` 空项目夹具 | 新增组件必须通过夹具 |
| 能力徽章夸大 | 信任损失 | 文档标注预估与未验证范围 | 建立可复核基准 |
| CSS 基座被误认为真实折射 | 预期落差 | 组件页与文档明确标注无背景位移/色散 | WebGL 旗舰提供可复核对照与降级 |

## 兼容矩阵

| 环境 | 状态 |
| --- | --- |
| Edge / Chromium 桌面 | 已验证（无头，行为回归 16/16） |
| Chrome 桌面 | 已验证（无头，行为回归 16/16） |
| Firefox 159 | 已验证（无头，跨引擎冒烟 7/7） |
| WebKit 27.2（Playwright 构建） | 已验证（无头，跨引擎冒烟 7/7；非 Safari 真机） |
| 移动 390×844 模拟 | 已验证（模拟，非真机） |
| Safari | 未验证 |
| iOS / Android 真机 | 未验证 |

## 维护约定

- 新增组件必须提供 `meta.ts`、`demo.tsx`、降级矩阵与可访问性说明。
- 组件源码不得引入站点路径别名、Tailwind 或 Provider 依赖。
- 所有玻璃组件的 T2 backdrop blur 不得超过 10px。
- 指针光效、视差、磁性位移必须响应 `prefers-reduced-motion` 的运行中切换。
- 提交前运行 `npm run typecheck && npm run lint && npm run check:copy && npm run build`。
- 行为回归使用 `npm run test:behavior`，会构建并启动生产服务器，覆盖复制文件集合、搜索筛选、深浅变体、材质切换、液态玻璃深浅色模式、GlassHero WebGL/深色 tint/失败回退/复制、36 组档位、Reduce 切换、弹窗与 WebGL 故障。CI 使用 `BEHAVIOR_SKIP_BUILD=1` 复用已构建产物。
- 跨引擎冒烟使用 `npm run test:browsers`，需要先安装 Playwright 的 Firefox / WebKit 浏览器；检查路由、React 挂载、中档模糊、液态玻璃 CSS 基座、GlassHero 深浅色 CSS 回退、浅色变体与弹窗。
- 发布前按“已验证范围”更新文档，不把模拟结果写成真机结论。

## 相关页面

- `/components` 组件库与筛选
- `/docs` 快速开始、主题与档位契约
- `/lab` Optical Lab 实验笔记
- `/legal` 许可、隶属关系与性能声明
