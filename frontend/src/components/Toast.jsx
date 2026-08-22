import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast: addToast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        maxWidth: 380,
        width: '100%'
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              background: t.type === 'error' ? '#2b1b12' : t.type === 'warning' ? '#3d291c' : '#231710',
              color: '#ffffff',
              border: `1px solid ${t.type === 'error' ? '#fca5a5' : t.type === 'warning' ? '#fff4c2' : '#cc9966'}`,
              padding: '14px 18px',
              borderRadius: 14,
              boxShadow: '0 10px 25px rgba(35, 23, 16, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600 }}>
              {t.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
              {t.type === 'warning' && <AlertTriangle size={18} color="#cc9966" />}
              {t.type === 'info' && <Info size={18} color="#b37a4c" />}
              {t.type === 'success' && <CheckCircle2 size={18} color="#cc9966" />}
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'transparent', border: 'none', color: '#d1c1b5', cursor: 'pointer', padding: 2 }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: (msg) => console.log('Toast:', msg) };
  }
  return context;
}
