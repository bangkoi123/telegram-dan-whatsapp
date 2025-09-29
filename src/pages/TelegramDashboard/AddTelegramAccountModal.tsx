import React, { useState } from 'react';
import TelegramOtpFlow from './TelegramOtpFlow';
import TelegramQrFlow from './TelegramQrFlow';

const AddTelegramAccountModal = ({ onClose, onAddAccount, apiConfig }) => {
    const [loginMethod, setLoginMethod] = useState('otp');

    const handleFinish = (phone, proxy) => {
        onAddAccount(phone, proxy);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <div className="modal-login-options">
                    <button
                        className={`btn-tab ${loginMethod === 'otp' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('otp')}
                    >
                        Login with OTP
                    </button>
                    <button
                        className={`btn-tab ${loginMethod === 'qr' ? 'active' : ''}`}
                        onClick={() => setLoginMethod('qr')}
                    >
                        Login with QR Code
                    </button>
                </div>
                <div className="modal-body">
                    {loginMethod === 'otp' ? <TelegramOtpFlow onFinish={handleFinish} apiConfig={apiConfig} /> : <TelegramQrFlow onFinish={handleFinish} apiConfig={apiConfig} />}
                </div>
            </div>
        </div>
    );
};

export default AddTelegramAccountModal;