import React, { useState } from 'react';
import ProxyForm from './ProxyForm';
import { apiClient } from '../../api/apiClient';
import { mockTelegramApi } from '../../api/mockApi'; // Keep for proxy testing

const TelegramOtpFlow = ({ onFinish, apiConfig }) => {
    const [step, setStep] = useState(1);
    const [credentials, setCredentials] = useState({ phone: '', otp: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showProxy, setShowProxy] = useState(false);
    const [proxyData, setProxyData] = useState({ protocol: 'SOCKS5', hostname: '', port: '', username: '', password: '' });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setCredentials(prev => ({ ...prev, [id]: value }));
        if (error) setError(null);
    };

    const handleProxyChange = (e) => {
        const { id, value } = e.target;
        setProxyData(prev => ({ ...prev, [id]: value }));
    }
    
    const handleSubmitDetails = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.telegramSendCode(apiConfig.apiId, apiConfig.apiHash, credentials.phone, proxyData);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const response = await apiClient.telegramSubmitCode(credentials.phone, credentials.otp);
            if (response.needs2fa) {
                setStep(3);
            } else {
                onFinish(credentials.phone, proxyData);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await apiClient.telegramSubmitPassword(credentials.phone, credentials.password);
            onFinish(credentials.phone, proxyData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderFormContent = () => {
        switch(step) {
            case 1:
                return (
                    <form onSubmit={handleSubmitDetails}>
                        <h2>Add Account via OTP</h2>
                        <p>Enter the phone number for the account you wish to add.</p>
                        {error && <p className="error-message">{error}</p>}
                        <div className="form-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input id="phone" type="tel" value={credentials.phone} onChange={handleChange} placeholder="+62..." required autoFocus disabled={isLoading}/>
                        </div>
                        
                        <div className="proxy-toggle">
                           <a onClick={() => setShowProxy(!showProxy)}>
                                {showProxy ? '- Hide Proxy Settings' : '+ Add Proxy (Optional)'}
                            </a>
                        </div>
                        
                        {showProxy && <ProxyForm proxyData={proxyData} onChange={handleProxyChange} api={mockTelegramApi} />}

                        <button type="submit" className="btn btn-primary" disabled={isLoading} style={{marginTop: '1rem'}}>
                            {isLoading ? 'Sending...' : 'Send Code'}
                        </button>
                    </form>
                );
            case 2:
                return (
                    <form onSubmit={handleVerifyOtp}>
                        <h2>Enter Verification Code</h2>
                        <p>A code was sent to the Telegram app for {credentials.phone}.</p>
                         {error && <p className="error-message">{error}</p>}
                        <div className="form-group">
                            <label htmlFor="otp">OTP Code</label>
                            <input id="otp" type="text" value={credentials.otp} onChange={handleChange} maxLength={6} required autoFocus style={{ textAlign: 'center', letterSpacing: '0.5rem' }} disabled={isLoading} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                             {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                );
            case 3:
                return (
                    <form onSubmit={handleVerifyPassword}>
                        <h2>Two-Factor Authentication</h2>
                        <p>This account is protected by a password.</p>
                        {error && <p className="error-message">{error}</p>}
                        <div className="form-group">
                            <label htmlFor="password">Password (2FA)</label>
                            <input id="password" type="password" value={credentials.password} onChange={handleChange} required autoFocus disabled={isLoading} />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                             {isLoading ? 'Verifying...' : 'Verify Account'}
                        </button>
                    </form>
                );
            default: return null;
        }
    }

    return (
        <div>
            {isLoading && <div className="loader-overlay"><div className="loader"></div></div>}
            {renderFormContent()}
        </div>
    )
};

export default TelegramOtpFlow;