import React from 'react';
import '../comp styles/Modal.css';

const Modal = ({ isVisible, onClose, children }) => {
    if (!isVisible) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <span className="close-button" onClick={onClose}>&times;</span>
                <div className="children">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
