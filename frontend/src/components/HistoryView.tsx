import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Database, RefreshCw, Calendar } from 'lucide-react';
import { UIStateWrapper } from './UIStateWrapper';

export const HistoryView: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'empty' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setStatus('loading');
    try {
      const res = await axios.get('/api/predictions/history');
      if (res.data && res.data.records) {
        setHistory(res.data.records);
        setStatus(res.data.records.length === 0 ? 'empty' : 'success');
      } else {
        setStatus('empty');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.error || 'Failed to load historical prediction records.');
    }
  };

  return (
    <div className="app-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div className="card-title">
          <Database size={20} color="var(--agri-green)" />
          <span>Historical Farm Prediction Logs</span>
        </div>
        <button className="btn-secondary" onClick={fetchHistory} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      <p className="card-subtitle">
        Audit log of all farm yield forecasts generated through the system with model metadata and environmental parameters.
      </p>

      <UIStateWrapper
        status={status}
        loadingText="Retrieving prediction logs from database..."
        errorMessage={errorMsg}
        emptyTitle="No Predictions Recorded Yet"
        emptyMessage="Generate your first crop yield forecast using the 'Yield Predictor' tab to view records here."
        onRetry={fetchHistory}
      >
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>District / Zone</th>
                <th>Crop & Season</th>
                <th>Area</th>
                <th>Soil (pH / Type)</th>
                <th>N-P-K (kg/ha)</th>
                <th>Predicted Yield</th>
                <th>Total Output</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={13} color="var(--slate-600)" />
                      <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </td>
                  <td><strong>{item.district}</strong></td>
                  <td>{item.crop} ({item.season})</td>
                  <td>{item.area_hectares} ha</td>
                  <td>pH {item.soil_ph} ({item.soil_type})</td>
                  <td style={{ fontSize: '0.8rem' }}>{item.nitrogen_kgha}-{item.phosphorus_kgha}-{item.potassium_kgha}</td>
                  <td>
                    <span className="badge-green" style={{ fontSize: '0.85rem' }}>
                      {item.predicted_yield_qha} q/ha
                    </span>
                  </td>
                  <td><strong>{item.total_production_q} q</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </UIStateWrapper>
    </div>
  );
};
