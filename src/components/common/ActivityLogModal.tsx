import React, { useState } from 'react';
import { ChatIcon, StatusIcon, BotIcon, ChannelIcon, ProfileIcon, PulseIcon, TelegramIcon, WhatsappIcon } from '../icons';

const ActivityIcon = ({ type }) => {
    switch (type) {
        case 'chat':
            return <ChatIcon />;
        case 'statusUpdate':
            return <StatusIcon />;
        case 'interactAI':
            return <BotIcon />;
        case 'joinChannels':
            return <ChannelIcon />;
        case 'updateProfile':
            return <ProfileIcon />;
        case 'cooldown':
            return <PulseIcon />
        default:
            return null;
    }
};

const exampleLogEntries = [
    {id: 1, platform: 'telegram', timestamp: Date.now() - 60000, activityType: 'statusUpdate', message: 'Account <strong>+1234567890</strong> posted a new status update (as a casual user...).' },
    {id: 2, platform: 'whatsapp', timestamp: Date.now() - 95000, activityType: 'chat', message: 'Account <strong>+628987654321</strong> sent a chat to <strong>+19876543210</strong>.' },
    {id: 3, platform: 'telegram', timestamp: Date.now() - 120000, activityType: 'chat', message: 'Account <strong>+998901234567</strong> sent a chat to <strong>+1234567890</strong>.' },
    {id: 4, platform: 'telegram', timestamp: Date.now() - 180000, activityType: 'interactAI', message: 'Account <strong>+1234567890</strong> interacted with an AI Bot.' },
    {id: 5, platform: 'whatsapp', timestamp: Date.now() - 210000, activityType: 'updateProfile', message: 'Account <strong>+628987654321</strong> updated its bio.' },
    {id: 6, platform: 'telegram', timestamp: Date.now() - 240000, activityType: 'cooldown', message: 'Account <strong>+628123456789</strong> is inactive. Skipping activity cycle to cool down.' },
];

const PlatformIcon = ({ platform }) => {
    if (platform === 'telegram') {
        return <span className="log-platform-icon" title="Telegram"><TelegramIcon width={16} height={16} /></span>;
    }
    if (platform === 'whatsapp') {
        return <span className="log-platform-icon" title="WhatsApp"><WhatsappIcon width={16} height={16} /></span>
    }
    return null;
}

const ActivityLog = ({ logEntries, onClear }) => {
    const [platformFilter, setPlatformFilter] = useState('all');

    const isExample = logEntries.length === 0;
    const sourceLogs = isExample ? exampleLogEntries : logEntries;

    const filteredLogs = sourceLogs.filter(entry => {
        if (platformFilter === 'all') return true;
        return entry.platform === platformFilter;
    });

    const filterOptions = ['all', 'telegram', 'whatsapp'];

    return (
        <div className="activity-log-widget">
            <div className="activity-log-header">
                <div>
                    <h2>Humanization Activity Log</h2>
                    <p>Real-time log of automated activities performed on your accounts.</p>
                </div>
                 <div className="activity-log-filters">
                    {filterOptions.map(filter => (
                        <button
                            key={filter}
                            className={`btn ${platformFilter === filter ? 'active' : ''}`}
                            onClick={() => setPlatformFilter(filter)}
                        >
                            {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="activity-log-list">
                {isExample && (
                    <div className="example-log-header">
                        This is an example log. Your real activities will appear here.
                    </div>
                )}
                {filteredLogs.length > 0 ? (
                    <ul>
                        {filteredLogs.map(entry => (
                            <li key={entry.id}>
                                <span className="log-timestamp">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>
                                <span className="log-icon" title={`Activity: ${entry.activityType}`}><ActivityIcon type={entry.activityType} /></span>
                                <span className="log-message" dangerouslySetInnerHTML={{ __html: entry.message }} />
                                <PlatformIcon platform={entry.platform} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="empty-state" style={{minHeight: '150px'}}>
                        <p>No activities recorded for this platform.</p>
                    </div>
                )}
            </div>
            
            <div className="activity-log-footer">
                 <button className="btn btn-secondary" onClick={onClear} disabled={isExample}>Clear Log</button>
            </div>
        </div>
    );
};

export default ActivityLog;