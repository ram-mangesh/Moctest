import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const COLORS = [
  { hex: "#1d4ed8", label: "Blue" },
  { hex: "#15803d", label: "Green" },
  { hex: "#b91c1c", label: "Red" },
  { hex: "#7c3aed", label: "Purple" },
  { hex: "#c2410c", label: "Orange" },
  { hex: "#0e7490", label: "Teal" },
  { hex: "#78716c", label: "Gray" },
  { hex: "#1c1917", label: "Black" },
];

const ScratchPad = () => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1d4ed8");
  const [size, setSize] = useState(2);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = e => {
    setDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const endDraw = () => {
    setDrawing(false);
    canvasRef.current?.getContext("2d")?.beginPath();
  };

  const draw = e => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const pos = getPos(e, canvas);

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 24;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = size;
      ctx.strokeStyle = color;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const clearBoard = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500;600&display=swap');

        .sp-root {
          font-family: 'DM Sans', sans-serif;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
          width: 300px;
          flex-shrink: 0;
        }

        .sp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .sp-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-3);
        }

        .sp-clear {
          font-size: 11px;
          font-weight: 600;
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 5px;
          padding: 3px 9px;
          cursor: pointer;
          transition: all 0.14s;
        }

        .sp-clear:hover {
          background: #fee2e2;
        }

        .sp-tools {
          display: flex;
          gap: 6px;
        }

        .sp-tool-btn {
          flex: 1;
          height: 32px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.14s ease;
          border: 1.5px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-family: 'DM Sans', sans-serif;
        }

        .sp-tool-on {
          background: #1c1917;
          border-color: #1c1917;
          color: #fff;
        }

        .sp-tool-off {
          background: var(--btn-ghost-bg);
          border-color: var(--btn-ghost-border);
          color: var(--btn-ghost-text);
        }

        .sp-tool-btn:hover {
          transform: scale(1.03);
        }

        .sp-colors {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .sp-color {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.14s;
        }

        .sp-color:hover { transform: scale(1.15); }

        .sp-color-active {
          border-color: #1c1917 !important;
          transform: scale(1.2);
          box-shadow: 0 0 0 2px rgba(255,255,255,0.8);
        }

        .sp-size-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sp-size-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-3);
          white-space: nowrap;
          min-width: 28px;
        }

        .sp-range {
          flex: 1;
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          border-radius: 99px;
          background: var(--option-border);
          outline: none;
          cursor: pointer;
        }

        .sp-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #1c1917;
          cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,0.2);
          transition: transform 0.14s;
        }

        .sp-range::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }

        .sp-size-val {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-2);
          min-width: 14px;
          text-align: right;
        }

        .sp-canvas-wrap {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--scratch-border);
          background: var(--scratch-canvas);
          position: relative;
          flex: 1;
        }

        /* Ruled lines on canvas background */
        .sp-canvas-wrap::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image: repeating-linear-gradient(
            transparent,
            transparent 23px,
            #e7e5e4 24px
          );
          opacity: 0.5;
        }

        .sp-canvas {
          display: block;
          cursor: crosshair;
          position: relative;
          z-index: 1;
          touch-action: none;
        }
      `}</style>

      <div className="sp-root">
        <div className="sp-header">
          <span className="sp-title">
            ✏ {t("mock.scratchpad", { defaultValue: "Scratch Pad" })}
          </span>
          <button className="sp-clear" onClick={clearBoard}>Clear</button>
        </div>

        <div className="sp-tools">
          <button
            onClick={() => setTool("pen")}
            className={`sp-tool-btn ${tool === "pen" ? "sp-tool-on" : "sp-tool-off"}`}
          >
            ✏ Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`sp-tool-btn ${tool === "eraser" ? "sp-tool-on" : "sp-tool-off"}`}
          >
            ◻ Eraser
          </button>
        </div>

        {tool === "pen" && (
          <>
            <div className="sp-colors">
              {COLORS.map(c => (
                <button
                  key={c.hex}
                  className={`sp-color ${color === c.hex ? "sp-color-active" : ""}`}
                  style={{ background: c.hex }}
                  onClick={() => setColor(c.hex)}
                  title={c.label}
                />
              ))}
            </div>
            <div className="sp-size-row">
              <span className="sp-size-label">Size</span>
              <input
                type="range"
                min={1}
                max={10}
                value={size}
                onChange={e => setSize(Number(e.target.value))}
                className="sp-range"
              />
              <span className="sp-size-val">{size}</span>
            </div>
          </>
        )}

        <div className="sp-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={268}
            height={380}
            className="sp-canvas"
            onMouseDown={startDraw}
            onMouseUp={endDraw}
            onMouseMove={draw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchEnd={endDraw}
            onTouchMove={draw}
          />
        </div>
      </div>
    </>
  );
};

export default ScratchPad;