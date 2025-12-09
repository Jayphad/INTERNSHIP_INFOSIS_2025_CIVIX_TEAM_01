import React from 'react';
import { X } from '../../assets/icons';
import '../../styles/Modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }
  
  const handleOverlayClick = (e) => {
    // Only close if the click is directly on the overlay
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">{title}</h3>
          <button onClick={onClose} className="modal-close-button" aria-label="Close modal">
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;