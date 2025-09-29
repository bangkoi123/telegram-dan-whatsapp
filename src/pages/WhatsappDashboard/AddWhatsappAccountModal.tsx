import React from 'react';
import WhatsappQrFlow from './WhatsappQrFlow';

const AddWhatsappAccountModal = ({ onClose, onAddAccount }) => {
    const handleFinish = (phone, proxy) => {
        onAddAccount(phone, proxy);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <div className="modal-body">
                   <WhatsappQrFlow onFinish={handleFinish} />
                </div>
            </div>
        </div>
    );
};

export default AddWhatsappAccountModal;