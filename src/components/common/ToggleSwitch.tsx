import React from 'react';

const ToggleSwitch = ({ isOn, onToggle }) => (
    <div className={`toggle-switch ${isOn ? 'on' : ''}`} onClick={onToggle}>
        <div className="toggle-knob" />
    </div>
);

export default ToggleSwitch;
