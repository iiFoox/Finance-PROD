import React from 'react';
import Toast, { ToastProps } from './Toast';

interface ToastData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemoveToast: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemoveToast }) => {
  return (
    <div className="toast-container space-y-3">
      {toasts.map((toast, index) => (
        <div 
          key={toast.id}
          className="toast-item"
          style={{ 
            transform: `translateY(${index * 5}px)`,
            zIndex: 100000 - index 
          }}
        >
          <Toast
            id={toast.id}
            type={toast.type}
            title={toast.title}
            message={toast.message}
            duration={toast.duration}
            onClose={onRemoveToast}
          />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer; 