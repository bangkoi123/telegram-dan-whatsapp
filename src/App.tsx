import React, { useState, useEffect, useCallback } from 'react';
import { ToastProvider, useToasts } from './context/ToastContext';
import HomePage from './pages/HomePage';
import TelegramDashboard from './pages/TelegramDashboard/TelegramDashboard';
import WhatsappDashboard from './pages/WhatsappDashboard/WhatsappDashboard';
import SettingsModal from './pages/TelegramDashboard/SettingsModal';
import ActivityLogModal from './components/common/ActivityLogModal';

const defaultHumanizationConfig = {
  isEnabled: false,
  intensity: 'medium',
  activities: {
    chat: true,
    statusUpdate: true,
    interactAI: true,
    joinChannels: false,
    updateProfile: false,
  },
  systemInstruction: 'You are a casual and friendly user talking to a friend.',
  aiApiKey: '',
};

const AppContent: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('home');
    const { addToast } = useToasts();

    const [apiConfig, setApiConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('telegramApiConfig');
            return saved ? JSON.parse(saved) : { apiId: '', apiHash: '' };
        } catch (e) { return { apiId: '', apiHash: '' }; }
    });

    const [humanizationConfig, setHumanizationConfig] = useState(() => {
        try {
            const saved = localStorage.getItem('humanizationConfig');
            const savedConfig = saved ? JSON.parse(saved) : {};
            return {
                ...defaultHumanizationConfig,
                ...savedConfig,
                activities: { ...defaultHumanizationConfig.activities, ...(savedConfig.activities || {}) }
            };
        } catch (e) { return defaultHumanizationConfig; }
    });

    const [activityLog, setActivityLog] = useState(() => {
        try {
            const saved = localStorage.getItem('activityLog');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isActivityLogOpen, setIsActivityLogOpen] = useState(false);

    useEffect(() => { localStorage.setItem('telegramApiConfig', JSON.stringify(apiConfig)); }, [apiConfig]);
    useEffect(() => { localStorage.setItem('humanizationConfig', JSON.stringify(humanizationConfig)); }, [humanizationConfig]);
    useEffect(() => { localStorage.setItem('activityLog', JSON.stringify(activityLog)); }, [activityLog]);

    const handleSaveSettings = useCallback(({ apiConfig: newApiConfig, humanizationConfig: newHumanizationConfig }) => {
        setApiConfig(newApiConfig);
        setHumanizationConfig(newHumanizationConfig);
        addToast({ type: 'success', message: 'Global settings saved successfully.' });
    }, [addToast]);

    const addLogEntry = useCallback((logEntry) => {
        setActivityLog(prev => [logEntry, ...prev].slice(0, 100));
    }, []);

    const handleClearLog = useCallback(() => {
        setActivityLog([]);
        addToast({ type: 'success', message: 'Activity log has been cleared.' });
    }, [addToast]);

    const renderPage = () => {
        switch(currentPage) {
            case 'telegram':
                return <TelegramDashboard onBack={() => setCurrentPage('home')} apiConfig={apiConfig} humanizationConfig={humanizationConfig} addLogEntry={addLogEntry} />;
            case 'whatsapp':
                return <WhatsappDashboard onBack={() => setCurrentPage('home')} humanizationConfig={humanizationConfig} addLogEntry={addLogEntry} />;
            case 'home':
            default:
                return <HomePage onNavigate={setCurrentPage} onOpenSettings={() => setIsSettingsModalOpen(true)} onOpenActivityLog={() => setIsActivityLogOpen(true)} />;
        }
    };
    
    return (
        <>
            {renderPage()}
            {isSettingsModalOpen && (
                <SettingsModal
                    onClose={() => setIsSettingsModalOpen(false)}
                    onSave={handleSaveSettings}
                    initialApiConfig={apiConfig}
                    initialHumanizationConfig={humanizationConfig}
                />
            )}
            {isActivityLogOpen && (
                <ActivityLogModal
                    isOpen={isActivityLogOpen}
                    onClose={() => setIsActivityLogOpen(false)}
                    logEntries={activityLog}
                    onClear={handleClearLog}
                />
            )}
        </>
    )
};

const App: React.FC = () => (
    <ToastProvider>
        <AppContent />
    </ToastProvider>
);

export default App;