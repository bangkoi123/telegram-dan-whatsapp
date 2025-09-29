import React, { useState } from 'react';
import { mockTelegramApi } from '../../api/mockApi'; // Generic API with test function

// Fix: Add explicit prop types to ensure compatibility with different API objects.
// The `api` prop is now typed to only require the `testProxyConnection` method,
// which is present in both `mockTelegramApi` and `mockWhatsappApi`.
const ProxyForm = ({ proxyData, onChange, api = mockTelegramApi }: {
    proxyData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    api?: { testProxyConnection: (proxy: any) => Promise<{ success: boolean; message: string; error?: string; }> };
}) => {
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState({ message: '', status: '' });

    const handleTestProxy = async () => {
        setIsTesting(true);
        setTestResult({ message: '', status: '' });
        const result = await api.testProxyConnection(proxyData);
        if (result.success) {
            setTestResult({ message: result.message, status: 'success' });
        } else {
            setTestResult({ message: result.message, status: 'error' });
        }
        setIsTesting(false);
    }

    return (
        <div className="proxy-form-container">
            <div className="form-group">
                <label htmlFor="protocol">Protocol</label>
                <select id="protocol" value={proxyData.protocol} onChange={onChange} disabled={isTesting}>
                    <option value="SOCKS5">SOCKS5</option>
                    <option value="HTTP">HTTP</option>
                </select>
            </div>
            <div className="proxy-grid">
                <div className="form-group">
                    <label htmlFor="hostname">Hostname/IP</label>
                    <input id="hostname" type="text" placeholder="proxy.example.com" value={proxyData.hostname} onChange={onChange} disabled={isTesting} />
                </div>
                <div className="form-group">
                    <label htmlFor="port">Port</label>
                    <input id="port" type="text" placeholder="1080" value={proxyData.port} onChange={onChange} disabled={isTesting} />
                </div>
            </div>
            <div className="proxy-grid" style={{marginTop: '1rem'}}>
                 <div className="form-group">
                    <label htmlFor="username">Username (Optional)</label>
                    <input id="username" type="text" placeholder="user" value={proxyData.username} onChange={onChange} disabled={isTesting} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password (Optional)</label>
                    <input id="password" type="password" placeholder="••••••••" value={proxyData.password} onChange={onChange} disabled={isTesting} />
                </div>
            </div>
            <div className="proxy-test-container">
                <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={handleTestProxy}
                    disabled={isTesting || !proxyData.hostname || !proxyData.port}
                >
                    {isTesting ? 'Testing...' : 'Test Connection'}
                </button>
                {testResult.message && (
                    <span className={`proxy-test-result ${testResult.status}`}>
                        {testResult.status === 'success' ? '✅' : '❌'} {testResult.message}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProxyForm;