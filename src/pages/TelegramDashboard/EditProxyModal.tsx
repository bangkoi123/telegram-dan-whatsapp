import React, { useState } from 'react';
import ProxyForm from './ProxyForm';
import { TrashIcon } from '../../components/icons';
import { mockTelegramApi } from '../../api/mockApi';

const EditProxyModal = ({ account, onClose, onSave }) => {
    const initialProxyData = {
        protocol: 'SOCKS5',
        hostname: '',
        port: '',
        username: '',
        password: '',
    };
    const [proxyData, setProxyData] = useState(account.proxy || initialProxyData);

    const handleProxyChange = (e) => {
        const { id, value } = e.target;
        setProxyData(prev => ({ ...prev, [id]: value }));
    }

    const handleSaveChanges = () => {
        // Basic validation: hostname and port are required if proxy is used
        if (proxyData.hostname && proxyData.port) {
            onSave(account.id, proxyData);
        } else if (!proxyData.hostname && !proxyData.port && !proxyData.username && !proxyData.password) {
            // If all fields are empty, consider it as removing the proxy
            handleRemoveProxy();
        } else {
            // Handle partial input case
            alert("Hostname and Port are required to save a proxy configuration.");
        }
    };

    const handleRemoveProxy = () => {
        if (account.proxy && window.confirm('Are you sure you want to remove the proxy from this account? The account will use the local IP address on its next connection.')) {
            onSave(account.id, null); // Pass null to indicate removal
        } else if (!account.proxy) {
            // If there's no proxy to begin with, just close
            onClose();
        }
    };

    // Determine which API to use based on some account property, or default
    // For now, we assume this modal is re-used and might need this, but we'll default to Telegram
    // In a real app, you might pass the API module as a prop.
    const api = mockTelegramApi; 

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h2>Edit Proxy for {account.phone}</h2>
                <p>Update the proxy details below or remove the proxy entirely.</p>
                
                <ProxyForm proxyData={proxyData} onChange={handleProxyChange} api={api} />

                <div className="modal-footer">
                    <button 
                        className="btn btn-danger" 
                        onClick={handleRemoveProxy}
                        style={{ marginRight: 'auto' }}
                        disabled={!account.proxy} // Disable if no proxy is set
                    >
                        <TrashIcon /> Remove Proxy
                    </button>
                    <button 
                        className="btn btn-primary" 
                        onClick={handleSaveChanges}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProxyModal;