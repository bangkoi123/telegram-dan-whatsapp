import React from 'react';

const Status = ({ status }) => (
  <div className={`status ${status}`}>
    <div className="status-indicator"></div>
    <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
  </div>
);

export default Status;
