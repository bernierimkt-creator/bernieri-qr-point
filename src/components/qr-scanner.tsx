import jsQR from "jsqr";
import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";

export function QrScanner({
  onResult,
  active = true,
}: {
  onResult: (text: string) => void;
  active?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let done = false;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setReady(true);
        tick();
      } catch {
        setError("Não foi possível acessar a câmera. Verifique a permissão do navegador.");
      }
    }

    function tick() {
      if (done) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const image = ctx.getImageData(0, 0, w, h);
          const result = jsQR(image.data, w, h, { inversionAttempts: "dontInvert" });
          if (result?.data) {
            done = true;
            onResultRef.current(result.data);
            return;
          }
        }
      }
      raf = requestAnimationFrame(tick);
    }

    start();
    return () => {
      done = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [active]);

  return (
    <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-ink">
      <video ref={videoRef} className="size-full object-cover" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />
      {ready && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="relative size-[68%] rounded-2xl border-2 border-glow/80 shadow-[0_0_0_9999px_rgba(11,17,32,0.45)]">
            <div className="animate-scan absolute inset-x-4 top-1/2 h-0.5 bg-glow shadow-[0_0_16px_2px_var(--glow)]" />
          </div>
        </div>
      )}
      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center text-ink-foreground/70">
          <div className="flex flex-col items-center gap-2 text-sm">
            <Camera className="size-6" /> Abrindo câmera…
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center p-6 text-center text-ink-foreground/80">
          <div className="flex flex-col items-center gap-2 text-sm">
            <CameraOff className="size-6" /> {error}
          </div>
        </div>
      )}
    </div>
  );
}
