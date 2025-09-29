import React, { useState, useEffect, useRef } from 'react';
import { EditIcon } from '../icons';

const DailyUsageBar = ({ usage, limit, accountId, onUpdateLimit }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentLimit, setCurrentLimit] = useState(limit);
    const inputRef = useRef<HTMLInputElement>(null);

    const percentage = Math.min((usage / limit) * 100, 100);
    
    let usageClass = 'low';
    if (percentage > 90) {
        usageClass = 'high';
    } else if (percentage > 60) {
        usageClass = 'medium';
    }

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);
    
    const handleSave = () => {
        const newLimitValue = parseInt(currentLimit, 10);
        if (!isNaN(newLimitValue) && newLimitValue > 0 && newLimitValue !== limit) {
            onUpdateLimit(accountId, newLimitValue);
        } else {
             setCurrentLimit(limit); // Revert if invalid or unchanged
        }
        setIsEditing(false);
    };
    
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            setCurrentLimit(limit);
            setIsEditing(false);
        }
    };

    return (
        <div className="usage-info">
            <div className="usage-header">
                <span className="usage-label">Daily Usage</span>
                <div className="usage-text" onClick={() => !isEditing && setIsEditing(true)}>
                    <span>{usage} / </span>
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="number"
                            className="limit-input"
                            value={currentLimit}
                            onChange={(e) => setCurrentLimit(e.target.value)}
                            onBlur={handleSave}
                            onKeyDown={handleKeyDown}
                        />
                    ) : (
                       <span className="editable-limit">
                           {limit}
                           <EditIcon />
                        </span>
                    )}
                </div>
            </div>
            <div className="usage-bar-container">
                <div 
                    className={`usage-bar-fill ${usageClass}`}
                    style={{ width: `${percentage}%` }}
                    aria-valuenow={percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    role="progressbar"
                ></div>
            </div>
        </div>
    );
};

export default DailyUsageBar;
