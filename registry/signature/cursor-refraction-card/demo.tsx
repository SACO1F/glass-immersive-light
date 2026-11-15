import { CursorRefractionCard } from "./index";

const backgroundSrc =
  "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=abstract%20iridescent%20glass%20waves%2C%20deep%20blue%20and%20magenta%20light%2C%20cinematic%2C%20high%20contrast%2C%20no%20text&image_size=landscape_4_3";

export function CursorRefractionCardDemo() {
  return (
    <CursorRefractionCard
      className="w-full max-w-md"
      backgroundSrc={backgroundSrc}
      displacement={10}
      blur={2}
      radius={28}
    >
      <div className="pt-20">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8fd8ff]">
          CursorRefractionCard
        </p>
        <h3 className="mt-3 text-2xl font-medium tracking-[-0.02em] text-[#f7fbff]">
          让背景在玻璃下弯曲
        </h3>
        <p className="mt-3 text-sm leading-7 text-[#d7e2ea]">
          背景先模糊，再由 SVG 位移滤镜产生折射；移动鼠标观察视差、环境光与边缘高光。
        </p>
        <button
          type="button"
          className="mt-6 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-white/15"
        >
          探索光感
        </button>
      </div>
    </CursorRefractionCard>
  );
}
