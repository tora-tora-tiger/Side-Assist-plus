import React from 'react';
import { Icon } from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
}) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/80 backdrop-blur-sm'
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl max-w-md w-full mx-4 ${className}`}
      >
        {/* Header */}
        {title && (
          <div className='flex items-center justify-between p-3 border-b border-gray-700/50'>
            <h3 className='text-base font-semibold text-stone-200'>{title}</h3>
            <button
              onClick={onClose}
              className='p-1 text-stone-400 hover:text-stone-200 transition-colors'
            >
              <Icon name='close' className='w-4 h-4' />
            </button>
          </div>
        )}

        {/* Content */}
        <div className='p-3'>{children}</div>

        {/* Close button if no title */}
        {!title && (
          <button
            onClick={onClose}
            className='absolute top-2 right-2 p-1 text-stone-400 hover:text-stone-200 transition-colors'
          >
            <Icon name='close' className='w-4 h-4' />
          </button>
        )}
      </div>
    </div>
  );
};
