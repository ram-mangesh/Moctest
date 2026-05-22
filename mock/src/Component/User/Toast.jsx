import React, { useState, useEffect } from "react";

let _addToast = () => {};

export const toast = (msg, type = "success") => _addToast(msg, type);

export function ToastProvider() {
  const [list, setList] = useState([]);
  
  useEffect(() => {
    _addToast = (msg, type) => {
      const id = Date.now();
      setList(p => [...p, { id, msg, type }]);
      setTimeout(() => setList(p => p.filter(t => t.id !== id)), 3200);
    };
  }, []);

  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  
  return (
    <div className="ep-toast-wrap">
      {list.map(t => (
        <div key={t.id} className={`ep-toast ${t.type}`}>
          <span>{icons[t.type] || "ℹ️"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
