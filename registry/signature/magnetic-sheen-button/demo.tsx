import { MagneticSheenButton } from "./index";

export function MagneticSheenButtonDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <MagneticSheenButton magnet={8}>靠近我</MagneticSheenButton>
      <MagneticSheenButton magnet={14} intensity={1}>
        更强磁力
      </MagneticSheenButton>
    </div>
  );
}
