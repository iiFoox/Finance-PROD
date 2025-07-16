import React, { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Animar entrada
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Auto close
    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, id]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
    }
  };

  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'toast-content toast-success';
      case 'error':
        return 'toast-content toast-error';
      case 'warning':
        return 'toast-content toast-warning';
      case 'info':
        return 'toast-content toast-info';
      default:
        return 'toast-content toast-success';
    }
  };

  return (
    <div
      className={`
        toast-item transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      aria-label={`Notificação ${type}: ${title}`}
    >
      <div className={getToastClass()}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="toast-title">
              {title}
            </h4>
            {message && (
              <p className="toast-message">
                {message}
              </p>
            )}
          </div>
          
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-200 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 p-1"
            aria-label="Fechar notificação"
            title="Fechar notificação"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-3 w-full bg-gray-700 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all ease-linear ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' :
              type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{
              width: '100%',
              animation: `toast-progress ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
      
      <style>
        {`
          @keyframes toast-progress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
};

export default Toast; 