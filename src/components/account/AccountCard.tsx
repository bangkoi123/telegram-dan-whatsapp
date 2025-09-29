import React from 'react';
import Status from '../common/Status';
import ToggleSwitch from '../common/ToggleSwitch';
import DailyUsageBar from '../common/DailyUsageBar';
import { RefreshIcon, ProxyIcon, PulseIcon, LightbulbIcon } from '../icons';

const getProxyErrorTooltip = (errorContext) => {
    switch(errorContext) {
        case 'proxy_auth_failed':
            return 'Proxy authentication failed. Click to edit.';
        case 'proxy_host_not_found':
            return 'Proxy host not found. Click to edit.';
        case 'proxy_timeout':
            return 'Proxy connection timed out. Click to edit.';
        default:
            return 'Proxy connection failed. Click to edit.';
    }
}

const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
};


const AccountCard: React.FC<{ 
    account: any;
    onDelete: (id: number) => void; 
    onToggle: (id: number) => void; 
    onRefresh: (id: number) => void; 
    onUpdateLimit: (id: number, newLimit: number) => void;
    onEditProxy: (account: any) => void;
    isHumanizationActive: boolean;
    onToggleHumanize: (id: number) => void;
}> = ({ account, onDelete, onToggle, onRefresh, onUpdateLimit, onEditProxy, isHumanizationActive, onToggleHumanize }) => {
    
    const isProxyConfigured = account.proxy && account.proxy.hostname;
    const isProxyError = !!account.errorContext;
    
    let proxyTooltip = 'No proxy configured. Click to add one.';
    if (isProxyConfigured) {
        proxyTooltip = isProxyError
            ? getProxyErrorTooltip(account.errorContext)
            : `Proxy: ${account.proxy.protocol}://${account.proxy.username ? `${account.proxy.username}@` : ''}${account.proxy.hostname}:${account.proxy.port}`;
    }

    const humanizationTooltip = isHumanizationActive
        ? `Humanization active. Last activity: ${account.lastActivity ? `${account.lastActivity.details} (${formatTimeAgo(account.lastActivity.timestamp)})` : 'None yet'}`
        : 'Humanization is inactive globally.';

    return (
        <div className={`account-card status-${account.status} ${!account.isEnabled ? 'disabled' : ''}`}>
            <div className="account-card-info">
                <div className="account-card-status-line">
                    <Status status={account.status} />
                    <p className="last-login">{account.lastLogin}</p>
                </div>
                <div className="account-card-primary-details">
                    <h3>{account.phone}</h3>
                    
                    {/* Per-account humanization toggle */}
                    {onToggleHumanize && (
                         <button
                            className={`humanization-toggle ${account.isHumanized ? 'active' : ''}`}
                            title={account.isHumanized ? 'Humanization active. Click to disable.' : 'Humanization inactive. Click to enable.'}
                            onClick={() => onToggleHumanize(account.id)}
                            aria-label="Toggle Humanization"
                            disabled={!account.isEnabled}
                        >
                            <LightbulbIcon />
                        </button>
                    )}

                    {isHumanizationActive && account.isEnabled && account.isHumanized && (
                        <span className="humanization-indicator" title={humanizationTooltip}>
                            <PulseIcon />
                        </span>
                    )}
                   
                    <button 
                        className={`proxy-indicator ${isProxyError ? 'error' : ''} ${!isProxyConfigured ? 'no-proxy' : ''}`} 
                        title={proxyTooltip}
                        onClick={() => onEditProxy(account)}
                        aria-label={isProxyConfigured ? "Edit Proxy" : "Add Proxy"}
                    >
                        <ProxyIcon />
                    </button>
                </div>
                <DailyUsageBar usage={account.dailyUsage} limit={account.dailyLimit} accountId={account.id} onUpdateLimit={onUpdateLimit} />
            </div>
            <div className="account-card-actions">
                <ToggleSwitch isOn={account.isEnabled} onToggle={() => onToggle(account.id)} />
                <button 
                    className={`btn btn-icon ${account.status === 'connecting' ? 'is-loading' : ''}`} 
                    aria-label="Refresh status" 
                    onClick={() => onRefresh(account.id)}
                    disabled={!account.isEnabled || account.status === 'connecting'}
                >
                    <RefreshIcon />
                </button>
                <button className="btn btn-danger" onClick={() => onDelete(account.id)} disabled={!account.isEnabled}>Delete</button>
            </div>
        </div>
    );
};

export default AccountCard;