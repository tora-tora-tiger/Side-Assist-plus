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
        className={`relative bg-gray-900 border border-gray-700/50 rounded-xl shadow-2xl max-w-lg w-full mx-4 ${className}`}
      >
        {/* Header */}
        {title && (
          <div className='flex items-center justify-between p-4 border-b border-gray-700/50'>
            <h3 className='text-lg font-semibold text-stone-200'>{title}</h3>
            <button
              onClick={onClose}
              className='p-1 text-stone-400 hover:text-stone-200 transition-colors'
            >
              <Icon name='close' className='w-5 h-5' />
            </button>
          </div>
        )}

        {/* Content */}
        <div className='p-6'>{children}</div>

        {/* Close button if no title */}
        {!title && (
          <button
            onClick={onClose}
            className='absolute top-3 right-3 p-1 text-stone-400 hover:text-stone-200 transition-colors'
          >
            <Icon name='close' className='w-5 h-5' />
          </button>
        )}
      </div>
    </div>
  );
};
