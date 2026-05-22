import { useEffect, useState } from "react";

let _addToast = () => {};
export function toast(msg, type = "success") { _addToast(msg, type); }

export function ToastProvider() {
  const [list, setList] = useState([]);
  useEffect(() => {
    _addToast = (msg, type) => {
      const id = Date.now();
      setList(prev => [...prev, { id, msg, type }]);
      setTimeout(() => setList(prev => prev.filter(t => t.id !== id)), 3000);
    };
  }, []);
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  return (
    <div className="ep-toast-wrap">
      {list.map(t => (
        <div key={t.id} className={`ep-toast ${t.type}`}>
          <span>{icons[t.type] || "ℹ️"}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
let _confirm = () => {};
export function confirmDialog(msg) {
  return new Promise(res => { _confirm(msg, res); });
}

export function ConfirmProvider() {
  const [state, setState] = useState(null);
  useEffect(() => {
    _confirm = (msg, res) => setState({ msg, res });
  }, []);
  if (!state) return null;
  const close = (v) => { state.res(v); setState(null); };
  return (
    <div className="ep-modal-overlay" onClick={() => close(false)}>
      <div className="ep-modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="ep-modal-body" style={{ paddingTop: 28, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🤔</div>
          <div style={{ fontWeight: 700, fontSize: 17, color: "var(--text)", marginBottom: 8 }}>Are you sure?</div>
          <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 24 }}>{state.msg}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="ep-btn ep-btn-ghost" onClick={() => close(false)}>Cancel</button>
            <button className="ep-btn ep-btn-danger" onClick={() => close(true)}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}