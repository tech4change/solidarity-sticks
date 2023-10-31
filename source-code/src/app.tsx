import { useCallback, useEffect, useState } from "preact/hooks";
import "./app.css";
import badge from "./assets/badge.png";
import flag from "./assets/flag.png";
import placement from "./assets/placement.png";

const watermarkChoices = [badge, flag] as const;

const canvasDim = 380;
const badgeWidth = canvasDim / 3;
const badgePad = 380 / 10;

const badgePlacements = {
  topLeft: { x: badgePad, y: badgePad },
  topRight: { x: canvasDim - badgeWidth - badgePad, y: badgePad },
  bottomLeft: { x: badgePad, y: canvasDim - badgeWidth - badgePad },
  bottomRight: { x: canvasDim - badgeWidth - badgePad, y: canvasDim - badgeWidth - badgePad },
};

export function App() {
  const [canvas, setCanvas] = useState<null | HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<null | CanvasRenderingContext2D>(null);

  const [bgBitmap, setBgBitMap] = useState<null | ImageBitmap>(null);

  const [selectedPosition, setSelectedPosition] = useState<Positions | "">("");
  const [watermark, setWatermark] = useState(watermarkChoices[0]);

  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    canvas && setCtx(canvas.getContext("2d", { willReadFrequently: true }));
  }, [canvas]);

  const drawBackground = useCallback(
    (bitmap: ImageBitmap) => {
      if (!ctx) throw new Error("2d rendering context not yet ready.");
      ctx.drawImage(bitmap, 0, 0, canvasDim, canvasDim);
    },
    [ctx]
  );

  useEffect(() => {
    if (!bgBitmap) return;
    drawBackground(bgBitmap);
  }, [bgBitmap]);

  type Positions = keyof typeof badgePlacements;

  const drawPng = useCallback(() => {
    if (!selectedPosition) return;
    bgBitmap && drawBackground(bgBitmap);

    const currentWatermark = new Image();
    currentWatermark.src = watermark;

    currentWatermark.onload = () => {
      ctx!.drawImage(
        currentWatermark,
        badgePlacements[selectedPosition]["x"],
        badgePlacements[selectedPosition]["y"],
        badgeWidth,
        badgeWidth
      );

      canvas?.toBlob(
        (blob) => {
          if (!blob) return;
          const blobUrl = URL.createObjectURL(blob);
          setBlobUrl(blobUrl);
        },
        "image/png",
        1
      );
    };
  }, [canvas, watermark, ctx, bgBitmap, selectedPosition, setBlobUrl]);

  useEffect(() => drawPng(), [selectedPosition, watermark, bgBitmap]);

  return (
    <main className='min-h-screen bg-slate-900 '>
      <div className='flex flex-col h-full max-w-[428px] items-center justify-center mx-auto'>
        <div className='flex flex-col justify-center h-full gap-4 p-6 text-white'>
          <h1 className='text-[32px] font-semibold'>Solidarity Sticks ✊</h1>

          {!bgBitmap && (
            <div className='h-[380px] w-[380px] flex flex-col items-center justify-center border border-dashed rounded-md gap-4'>
              <span className='text-lg font-semibold'>📸 Upload a square profile photo</span>
              <label className='py-3 px-6 bg-[#149954] font-semibold rounded-lg cursor-pointer'>
                Browse files
                <input
                  onChange={async (e) => {
                    const file = e.currentTarget.files?.[0];
                    if (!file) throw new Error("Issue reading file");
                    const bitmap = await createImageBitmap(file);
                    setBgBitMap(bitmap);
                    setSelectedPosition("topLeft");
                  }}
                  type='file'
                  accept='image/*'
                  className='hidden'
                />
              </label>
            </div>
          )}

          <div className={`${bgBitmap ? "" : "hidden"} w-[250px]`}>
            <canvas width={canvasDim} height={canvasDim} ref={setCanvas}></canvas>
          </div>

          {bgBitmap && (
            <>
              <div className=''>
                <h4>Choose a sticker</h4>

                <div className='flex items-center gap-4 pt-2'>
                  {watermarkChoices.map((wmk) => {
                    return (
                      <button
                        onClick={() => setWatermark(wmk)}
                        className={`p-2 bg-gradient-to-t from-slate-600 to-slate-900 h-[86px] w-[86px] border-4 rounded-md ${
                          watermark === wmk ? " border-green-500" : "border-transparent"
                        }`}
                      >
                        <img width={100} height={100} src={wmk} />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4>Change the position</h4>

                <div className='flex items-center gap-3 pt-2'>
                  <button
                    className={`rotate-90 rounded-md border-4 h-[86px] w-[86px] ${
                      selectedPosition === "topLeft" ? " border-green-500" : "border-transparent"
                    }`}
                    disabled={!bgBitmap}
                    onClick={() => setSelectedPosition("topLeft")}
                  >
                    <img src={placement} />
                  </button>

                  <button
                    className={`-rotate-180 rounded-md border-4 h-[86px] w-[86px] ${
                      selectedPosition === "topRight" ? " border-green-500" : "border-transparent"
                    }`}
                    disabled={!bgBitmap}
                    onClick={() => setSelectedPosition("topRight")}
                  >
                    <img src={placement} />
                  </button>

                  <button
                    disabled={!bgBitmap}
                    className={`rounded-md border-4 h-[86px] w-[86px] ${
                      selectedPosition === "bottomLeft" ? " border-green-500" : "border-transparent"
                    }`}
                    onClick={() => setSelectedPosition("bottomLeft")}
                  >
                    <img src={placement} />
                  </button>

                  <button
                    className={`-rotate-90 rounded-md border-4 h-[86px] w-[86px] ${
                      selectedPosition === "bottomRight"
                        ? " border-green-500"
                        : "border-transparent"
                    }`}
                    disabled={!bgBitmap}
                    onClick={() => setSelectedPosition("bottomRight")}
                  >
                    <img src={placement} />
                  </button>
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <a
                  href={blobUrl}
                  download='my-img.png'
                  title='Download my img'
                  className='rounded-md bg-[#149954] py-3 text-white text-center'
                >
                  Download
                </a>

                <button
                  className='rounded-md border border-[#149954] py-3'
                  onClick={() => {
                    setBgBitMap(null);
                    setSelectedPosition("");
                    setWatermark(watermarkChoices[0]);
                  }}
                >
                  Start Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
