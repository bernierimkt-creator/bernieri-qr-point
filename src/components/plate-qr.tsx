import QRCode from "react-qr-code";
import { cn } from "@/lib/utils";

export function PlateQr({
  value,
  size = 160,
  className,
  id,
}: {
  value: string;
  size?: number;
  className?: string;
  id?: string;
}) {
  return (
    <div
      className={cn("inline-block rounded-xl border border-border bg-card p-2", className)}
      style={{ width: size + 16, height: size + 16 }}
    >
      {value ? (
        <QRCode id={id} value={value} size={size} level="M" bgColor="#ffffff" fgColor="#0b1120" />
      ) : (
        <div className="size-full animate-pulse rounded-md bg-muted" />
      )}
    </div>
  );
}
