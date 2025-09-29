import React, { useState, useEffect, useRef } from 'react';
import { useToasts } from '../../context/ToastContext';
import { mockTelegramApi } from '../../api/mockApi';
import QrCodePlaceholder from '../../components/common/QrCodePlaceholder';
import ProxyForm from './ProxyForm';

const TelegramQrFlow = ({ onFinish, apiConfig }) => {
    const { addToast } = useToasts();
    const [step, setStep] = useState(1);
    const [credentials, setCredentials] = useState({ phone: '' });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState(null);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [countdown, setCountdown] = useState(0);
    const [showProxy, setShowProxy] = useState(false);
    const [proxyData, setProxyData] = useState({ protocol: 'SOCKS5', hostname: '', port: '', username: '', password: '' });
    // Fix: Changed NodeJS.Timeout to number for the timer ref type, as setInterval returns a number in browser environments.
    const timerRef = useRef<number | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };
    
    useEffect(() => {
        if (countdown > 0) {
            timerRef.current = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0 && qrCodeData) {
            // QR Expired, regenerate
            clearTimer();
            if(step === 2) { // Only auto-regenerate if we are on the QR screen
                addToast({ type: 'error', message: "QR Code expired. Generating a new one." });
                handleGenerateQr(new Event('submit'));
            }
        }
        return () => clearTimer();
    }, [countdown, qrCodeData, step]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setCredentials(prev => ({ ...prev, [id]: value }));
        if (error) setError(null);
    };

    const handleProxyChange = (e) => {
        const { id, value } = e.target;
        setProxyData(prev => ({ ...prev, [id]: value }));
    }

    const handleGenerateQr = async (e) => {
        if(e) e.preventDefault();
        setIsGenerating(true);
        setError(null);
        clearTimer();
        setQrCodeData(null);
        try {
            const response = await mockTelegramApi.getQrCode(apiConfig.apiId, apiConfig.apiHash, credentials.phone, proxyData);
            setQrCodeData(response);
            setCountdown(response.countdown);
            setStep(2);
        } catch (err) {
            setError(err.message);
            setStep(1);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleConfirmScan = async () => {
        if (countdown <= 0) {
            addToast({ type: 'error', message: 'Cannot confirm, QR code has already expired.' });
            return;
        }
        setIsConfirming(true);
        try {
            await mockTelegramApi.confirmQrScan(qrCodeData.sessionId);
            clearTimer();
            onFinish(credentials.phone, proxyData);
        } catch (err) {
            if (err.error === 'QR_CODE_EXPIRED') {
                addToast({ type: 'error', message: "Confirmation failed: QR code expired. Regenerating..." });
                handleGenerateQr(null); // Regenerate without event
            } else {
                addToast({ type: 'error', message: "Confirmation failed. Please try again." });
                setStep(1);
            }
            setError(null);
        } finally {
            setIsConfirming(false);
        }
    };
    
    const isQrExpired = countdown <= 0 && qrCodeData;

    return (
        <>
            {step === 1 && (
                <form onSubmit={handleGenerateQr}>
                    <h2>Add Account via QR Code</h2>
                     <p>Enter the phone number for the account you wish to add.</p>
                    {error && <p className="error-message">{error}</p>}
                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input id="phone" type="tel" value={credentials.phone} onChange={handleChange} placeholder="+1 234 567 8900" required autoFocus disabled={isGenerating}/>
                    </div>

                    <div className="proxy-toggle">
                        <a onClick={() => setShowProxy(!showProxy)}>
                            {showProxy ? '- Hide Proxy Settings' : '+ Add Proxy (Optional)'}
                        </a>
                    </div>
                    
                    {showProxy && <ProxyForm proxyData={proxyData} onChange={handleProxyChange} api={mockTelegramApi} />}

                    <button type="submit" className="btn btn-primary" disabled={isGenerating} style={{marginTop: '1rem'}}>
                        {isGenerating ? 'Generating...' : 'Generate QR Code'}
                    </button>
                </form>
            )}
            {step === 2 && (
                <div style={{ textAlign: 'center' }}>
                    {(isConfirming || isGenerating) && <div className="loader-overlay"><div className="loader"></div><p style={{marginTop: '1rem'}}>{isConfirming ? 'Confirming login...' : 'Generating new QR Code...'}</p></div>}
                    <h2>Scan QR Code</h2>
                    <p>Open Telegram on your phone, go to Settings &gt; Devices &gt; Link Desktop Device and scan the QR code.</p>
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

                    <button onClick={handleConfirmScan} className="btn btn-primary" disabled={isConfirming || isGenerating || isQrExpired} style={{marginTop: '1.5rem'}}>
                        {isConfirming ? 'Confirming...' : 'I Have Scanned, Confirm Login'}
                    </button>
                </div>
            )}
        </>
    );
};

export default TelegramQrFlow;