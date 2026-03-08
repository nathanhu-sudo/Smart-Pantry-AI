import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Camera, ScanLine, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePantry } from "@/hooks/usePantry";
import { toast } from "sonner";

export default function ScannerPage() {
  const { scanItem, addItem } = usePantry();
  const [scanning, setScanning] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const openCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
      });
      setStream(mediaStream);
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
    } catch {
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  };

  const closeCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraOpen(false);
  };

  const captureAndScan = async () => {
    setScanning(true);
    try {
      const item = await scanItem();
      if (item) {
        toast.success(`Scanned: ${item.name}`, {
          description: `${item.weightKg} kg · ${item.shelfLifeDays} day shelf life`,
        });
      }
      closeCamera();
    } finally {
      setScanning(false);
    }
  };

  const quickScan = async () => {
    setScanning(true);
    try {
      const item = await scanItem();
      if (item) {
        toast.success(`Scanned: ${item.name}`, {
          description: `${item.weightKg} kg · ${item.shelfLifeDays} day shelf life`,
        });
      }
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h2 className="text-xl font-serif font-bold text-foreground mb-1">AI Scanner</h2>
        <p className="text-sm text-muted-foreground">Use your camera to identify and add grocery items instantly</p>
      </div>

      {cameraOpen ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-2xl overflow-hidden bg-foreground aspect-[3/4] max-h-[500px] w-full"
        >
          <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="hidden" />

          {/* Scan overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="relative w-48 h-48 border-2 border-primary-foreground rounded-2xl opacity-70">
              <span className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg" />
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-lg" />
              <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-lg" />
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg" />
            </div>
            <p className="text-primary-foreground text-sm bg-foreground/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Point camera at grocery item
            </p>
          </div>

          {/* Controls */}
          <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-4 px-6">
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-card/80 backdrop-blur" onClick={closeCamera}>
              <X className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="rounded-full h-16 w-16 gap-0 animate-pulse-green"
              onClick={captureAndScan}
              disabled={scanning}
            >
              {scanning ? <Sparkles className="h-7 w-7 animate-spin" /> : <ScanLine className="h-7 w-7" />}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4"
        >
          {/* Camera button */}
          <button
            onClick={openCamera}
            className="w-full rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-12 flex flex-col items-center gap-4"
          >
            <div className="rounded-full bg-primary p-5 shadow-lg">
              <Camera className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Open Camera</p>
              <p className="text-sm text-muted-foreground mt-0.5">Works on iPhone & Android</p>
            </div>
          </button>

          {/* Quick AI scan (demo) */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            size="lg"
            variant="outline"
            className="w-full h-14 gap-2 text-base font-semibold animate-pulse-green"
            onClick={quickScan}
            disabled={scanning}
          >
            {scanning ? (
              <><Sparkles className="h-5 w-5 animate-spin" /> Scanning…</>
            ) : (
              <><ScanLine className="h-5 w-5" /> Quick AI Scan (Demo)</>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Demo mode randomly adds a common grocery item. Real AI scanning uses your camera.
          </p>
        </motion.div>
      )}

      {/* Tips */}
      <div className="rounded-2xl bg-secondary/50 border p-5 flex flex-col gap-3">
        <p className="text-sm font-semibold text-foreground">Tips for best results</p>
        <ul className="text-sm text-muted-foreground flex flex-col gap-2">
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> Point at the barcode or the item itself</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> Good lighting improves accuracy</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span> Hold steady for 1–2 seconds</li>
        </ul>
      </div>
    </div>
  );
}
