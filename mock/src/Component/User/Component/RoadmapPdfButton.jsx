import { useState } from "react";

const RoadmapPdfButton = ({ attemptId }) => {
  const [loading, setLoading] = useState(false);

  const download = async () => {
    if (!attemptId) { alert("No attempt ID available. Submit a test first."); return; }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8089/api/user/roadmap/export/${attemptId}`,
        { method: "GET", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error(`Server returned ${response.status}`);
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url; link.download = `roadmap_${attemptId}.pdf`;
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        @keyframes rpdfSpin { to { transform: rotate(360deg); } }
        .rpdf-btn {
          display:inline-flex;align-items:center;gap:8px;
          padding:10px 22px;border-radius:12px;
          font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:700;
          border:none;cursor:pointer;transition:all .22s;position:relative;overflow:hidden;
        }
        .rpdf-btn.act {
          background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
          box-shadow:0 4px 16px rgba(99,102,241,.38);
        }
        .rpdf-btn.act::before {
          content:'';position:absolute;inset:0;
          background:linear-gradient(120deg,transparent,rgba(255,255,255,.2),transparent);
          transform:translateX(-100%);transition:transform .5s;
        }
        .rpdf-btn.act:hover::before { transform:translateX(100%); }
        .rpdf-btn.act:hover { transform:translateY(-2px);box-shadow:0 8px 28px rgba(99,102,241,.46); }
        .rpdf-btn.dis { background:rgba(99,102,241,.1);color:rgba(99,102,241,.35);cursor:not-allowed;border:1.5px solid rgba(99,102,241,.12); }
        .rpdf-spinner { width:14px;height:14px;border-radius:50%;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;animation:rpdfSpin .7s linear infinite;flex-shrink:0; }
      `}</style>
      <button
        onClick={download}
        disabled={loading || !attemptId}
        className={`rpdf-btn ${loading || !attemptId ? "dis" : "act"}`}
      >
        {loading ? (<><span className="rpdf-spinner" />Generating PDF…</>) : <>📄 Download Study Roadmap PDF</>}
      </button>
    </>
  );
};

export default RoadmapPdfButton;
