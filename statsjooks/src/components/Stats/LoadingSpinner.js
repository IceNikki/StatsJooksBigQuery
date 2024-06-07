import React from 'react';

export default function LoadingSpinner({ progress }) {
    return (
        <div>
            <div className="progressBar">
                <div className="progress" style={{ width: `${progress}%` }}>{progress}%</div>
            </div>
            <p>Loading...</p>
        </div>
    );
}
