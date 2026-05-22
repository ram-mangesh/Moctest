import { useEffect, useState } from "react";

let _addToast = () => {};
export const toast = (msg, type = "success") => _addToast(msg, type);

export function ToastProvider() {
  const [list, setList] = useState([]);

  useEffect(() => {
    _addToast = (msg, type) => {
      const id = Date.now();
      setList(p => [...p, { id, msg, type }]);
      setTimeout(() => {
        setList(p => p.filter(t => t.id !== id));
      }, 3000);
    };
  }, []);

  const icons = {
    success: "✅",
    error: "❌",
    info: "ℹ️"
  };

  return (
    <div className="fixed bottom-6 right-6 space-y-2 z-50">
      {list.map(t => (
        <div
          key={t.id}
          className="bg-black text-white px-4 py-2 rounded shadow-lg flex items-center gap-2"
        >
          <span>{icons[t.type]}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}