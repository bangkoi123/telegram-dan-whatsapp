import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useToasts } from '../../context/ToastContext';
import { mockWhatsappApi } from '../../api/mockApi';
import QrCodePlaceholder from '../../components/common/QrCodePlaceholder';
import ProxyForm from '../TelegramDashboard/ProxyForm'; // Re-use the proxy form

const WhatsappQrFlow = ({ onFinish }) => {
    const { addToast } = useToasts();
    const [qrCodeData, setQrCodeData] = useState(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [isConfirming, setIsConfirming] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showProxy, setShowProxy] = useState(false);
    const [proxyData, setProxyData] = useState({ protocol: 'HTTP', hostname: '', port: '', username: '', password: '' });
    // Fix: Changed NodeJS.Timeout to number for the timer ref type, as setInterval returns a number in browser environments.
    const timerRef = useRef<number | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const generateQr = useCallback(async () => {
        setIsGenerating(true);
        clearTimer();
        setQrCodeData(null);
        try {
            const response = await mockWhatsappApi.getQrCode(proxyData);
            setQrCodeData(response);
            setCountdown(response.countdown);
        } catch (err) {
            addToast({ type: 'error', message: "Could not generate QR code. Retrying..." });
            // Retry after a short delay
            setTimeout(generateQr, 3000);
        } finally {
            setIsGenerating(false);
        }
    }, [proxyData, addToast]);
    
    useEffect(() => {
        generateQr();
        // Cleanup on unmount
        return () => clearTimer();
    }, [generateQr]);

    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0 && qrCodeData) {
            // QR Expired, regenerate
            clearTimer();
            addToast({ type: 'error', message: "QR Code expired. Generating a new one." });
            generateQr();
        }
        return () => clearTimer();
    }, [countdown, qrCodeData, generateQr]);

    const handleProxyChange = (e) => {
        const { id, value } = e.target;
        setProxyData(prev => ({ ...prev, [id]: value }));
    };

    const handleConfirmScan = async () => {
        if (countdown <= 0) {
            addToast({ type: 'error', message: 'Cannot confirm, QR code has already expired.' });
            return;
        }
        setIsConfirming(true);
        try {
            const response = await mockWhatsappApi.confirmQrScan(qrCodeData.sessionId);
            clearTimer();
            onFinish(response.phone, proxyData);
        } catch (err) {
            if (err.error === 'QR_CODE_EXPIRED') {
                addToast({ type: 'error', message: "Confirmation failed: QR code expired. A new code has been generated." });
                // The timer expiry logic will handle regeneration automatically.
                // We just need to ensure the timer is cleared and countdown is 0.
                clearTimer();
                setCountdown(0);
            } else {
                 addToast({ type: 'error', message: "Confirmation failed. Please try again." });
            }
        } finally {
            setIsConfirming(false);
        }
    };
    
    const isQrExpired = countdown <= 0 && qrCodeData;

    return (
        <div style={{ textAlign: 'center' }}>
            {(isConfirming || isGenerating) && <div className="loader-overlay"><div className="loader"></div><p style={{marginTop: '1rem'}}>{isConfirming ? 'Confirming login...' : 'Generating QR Code...'}</p></div>}
            <h2>Link with WhatsApp</h2>
            <p>Open WhatsApp on your phone, go to Settings &gt; Linked Devices &gt; Link a Device and scan the QR code.</p>
            <p style={{ fontSize: '0.85rem', fontStyle: 'italic', opacity: 0.8, marginTop: '-0.5rem', marginBottom: '1rem' }}>
                (This is a simulation. Just click the 'Confirm Login' button below to proceed.)
            </p>
            
            <div className="qr-code-container">
                {qrCodeData ? (
                    <div className={`qr-code-wrapper ${isQrExpired ? 'expired' : ''}`}>
                        <QrCodePlaceholder svgString={qrCodeData.qrCodeSvg} />
                    </div>
                ) : <div className="loader"></div>}
                {isQrExpired && !isGenerating && (
                    <div className="qr-code-overlay">
                        <span>Expired</span>
                    </div>
                )}
            </div>
            
            <p className={`qr-countdown ${isQrExpired ? 'expired' : ''}`}>
                {isQrExpired ? 'Expired' : `Expires in: ${countdown}s`}
            </p>

            <div className="proxy-toggle">
                <a onClick={() => setShowProxy(!showProxy)}>
                    {showProxy ? '- Hide Proxy Settings' : '+ Add Proxy (Optional)'}
                </a>
            </div>
            
            {showProxy && <ProxyForm proxyData={proxyData} onChange={handleProxyChange} api={mockWhatsappApi} />}

            <button onClick={handleConfirmScan} className="btn btn-primary" disabled={isConfirming || isGenerating || isQrExpired} style={{marginTop: '1.5rem'}}>
                {isConfirming ? 'Confirming...' : 'I Have Scanned, Confirm Login'}
            </button>
        </div>
    );
};

export default WhatsappQrFlow;