import React, { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  children,
  title,
  size = 'medium',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = ''
}) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (closeOnEscape && event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus the modal for accessibility
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 100);
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle close button click
  const handleCloseClick = () => {
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div 
      className={`modal-backdrop ${isOpen ? 'open' : ''}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        className={`modal-container ${size} ${className}`}
        ref={modalRef}
        tabIndex={-1}
        role="document"
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="modal-header">
            {title && (
              <h2 id="modal-title" className="modal-title">
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                className="modal-close-button"
                onClick={handleCloseClick}
                aria-label="Close modal"
                type="button"
              >
                <span className="close-icon">×</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Content */}
        <div className="modal-content">
          {children}
        </div>

        {/* Optional Footer - can be passed as children with specific class */}
        {/* Example: <div className="modal-footer">Footer content</div> */}
      </div>
    </div>
  );
};

export default Modal;