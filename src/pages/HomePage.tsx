import React from 'react';
import { TelegramIcon, WhatsappIcon, SettingsIcon } from '../components/icons';
import ActivityLog from '../components/common/ActivityLogModal';

const HomePage = ({ onNavigate, onOpenSettings, logEntries, onClear }) => (
    <div className="home-page page">
        <header className="home-header">
            <button className="btn btn-icon btn-settings" onClick={onOpenSettings} aria-label="Settings">
                <SettingsIcon />
            </button>
        </header>
        <div className="home-content">
            <div>
                <h1>Welcome to Account Manager</h1>
                <p>Your central hub for managing both Telegram and WhatsApp accounts seamlessly.
                <br />
                Select a service below to get started.</p>
            </div>
            <div className="manager-selection">
                <div className="manager-card" onClick={() => onNavigate('telegram')}>
                    <div className="manager-card-icon telegram">
                        <TelegramIcon />
                    </div>
                    <h2>Telegram Manager</h2>
                    <p>Manage accounts using API ID/Hash, OTP, or QR Code logins.</p>
                </div>
                <div className="manager-card" onClick={() => onNavigate('whatsapp')}>
                    <div className="manager-card-icon whatsapp">
                        <WhatsappIcon />
                    </div>
                    <h2>WhatsApp Manager</h2>
                    <p>Quickly link and manage accounts using a simple QR Code scan.</p>
                </div>
            </div>
            <ActivityLog logEntries={logEntries} onClear={onClear} />
        </div>
    </div>
);

export default HomePage;