import React, { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

export interface SimpleToastProps {
  show: boolean;
  type: 'success' | 'error';
  title: string;
  message?: string;
  onClose: () => void;
}

const SimpleToast: React.FC<SimpleToastProps> = ({ 
  show, 
  type, 
  title, 
  message, 
  onClose 
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      // Auto close após 5 segundos
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!show && !visible) return null;

  return (
    <>
      {/* Overlay para garantir que apareça por cima de tudo */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        <div className="absolute top-20 right-4">
          <div
            className={`
              max-w-sm w-full transform transition-all duration-300 ease-in-out pointer-events-auto
              ${visible 
                ? 'translate-x-0 opacity-100 scale-100' 
                : 'translate-x-full opacity-0 scale-95'
              }
            `}
          >
            <div 
              className={`
                ${type === 'success' 
                  ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                }
                border rounded-lg shadow-lg p-4 backdrop-blur-sm
              `}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
              aria-label={`Notificação ${type}: ${title}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h4>
                  {message && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {message}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={handleClose}
                  className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  aria-label="Fechar notificação"
                  title="Fechar notificação"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SimpleToast; 