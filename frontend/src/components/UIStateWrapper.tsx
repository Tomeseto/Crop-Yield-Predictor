import React from 'react';
import { AlertCircle, FolderOpen } from 'lucide-react';

interface UIStateWrapperProps {
  status: 'idle' | 'loading' | 'error' | 'empty' | 'success';
  loadingText?: string;
  errorMessage?: string;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const UIStateWrapper: React.FC<UIStateWrapperProps> = ({
  status,
  loadingText = 'Processing request...',
  errorMessage = 'An error occurred while communicating with the server.',
  emptyTitle = 'No Records Found',
  emptyMessage = 'There is no data available to display at this moment.',
  onRetry,
  children
}) => {
  if (status === 'loading') {
    return (
      <div className="state-loading app-card">
        <div className="spinner"></div>
        <p style={{ fontWeight: 600, color: 'var(--slate-700)' }}>{loadingText}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
          Please wait while the system completes the operation.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="state-error app-card" style={{ borderColor: 'var(--red-100)', backgroundColor: '#fff5f5' }}>
        <AlertCircle size={40} color="var(--red-600)" style={{ marginBottom: '0.75rem' }} />
        <h3 style={{ color: 'var(--red-600)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>
          Operation Failed
        </h3>
        <p style={{ color: 'var(--slate-700)', fontSize: '0.875rem', maxWidth: '480px', marginBottom: '1rem' }}>
          {errorMessage}
        </p>
        {onRetry && (
          <button className="btn-secondary" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className="state-empty app-card">
        <FolderOpen size={42} color="var(--slate-600)" style={{ marginBottom: '0.75rem' }} />
        <h3 style={{ color: 'var(--slate-800)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.35rem' }}>
          {emptyTitle}
        </h3>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', maxWidth: '420px' }}>
          {emptyMessage}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
