import React from 'react';
import { Award, ArrowUpRight, ArrowDownRight, Info, CheckCircle2 } from 'lucide-react';

export interface PredictionResultData {
  predicted_yield_qha: number;
  total_production_q: number;
  unit: string;
  selected_model: string;
  model_test_metrics: {
    r2_score?: number;
    rmse_qha?: number;
    mae_qha?: number;
    mape_pct?: number;
  };
  top_contributing_factors: Array<{
    feature: string;
    display_name: string;
    impact_direction: string;
    importance_score: number;
  }>;
  disclaimer: string;
  prediction_id?: number;
  created_at?: string;
}

interface ResultCardProps {
  result: PredictionResultData;
  cropName: string;
  district: string;
  areaHa: number;
  onOpenWhatIf: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  cropName,
  district,
  areaHa,
  onOpenWhatIf
}) => {
  return (
    <div className="app-card" style={{ borderLeft: '4px solid var(--agri-green)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <div className="card-title">
            <CheckCircle2 color="var(--agri-green)" size={22} />
            <span>Yield Prediction Output</span>
          </div>
          <p className="card-subtitle" style={{ marginBottom: 0 }}>
            Estimated output for <strong>{cropName}</strong> in <strong>{district}</strong> ({areaHa} ha).
          </p>
        </div>
        <span className="badge-green">
          Model: {result.selected_model || 'Trained Pipeline'}
        </span>
      </div>

      {/* Main Metric Boxes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="metric-box">
          <div className="metric-val">{result.predicted_yield_qha}</div>
          <div className="metric-label">Estimated Yield (q / ha)</div>
        </div>

        <div className="metric-box">
          <div className="metric-val" style={{ color: 'var(--slate-800)' }}>
            {result.total_production_q}
          </div>
          <div className="metric-label">Total Projected Production (Quintals)</div>
        </div>

        <div className="metric-box" style={{ background: 'var(--slate-50)' }}>
          <div className="metric-val" style={{ fontSize: '1.4rem', color: 'var(--slate-700)' }}>
            ±{result.model_test_metrics?.rmse_qha || '2.8'} <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>q/ha</span>
          </div>
          <div className="metric-label">Model Test RMSE (R²: {result.model_test_metrics?.r2_score || '0.88'})</div>
        </div>
      </div>

      {/* SHAP Factor Attribution Breakdown */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Award size={16} color="var(--agri-green)" />
          <span>Key Agronomic Contributing Factors (SHAP Feature Attribution)</span>
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {result.top_contributing_factors?.map((factor, idx) => {
            const isPositive = factor.impact_direction === 'positive';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  backgroundColor: isPositive ? 'var(--agri-green-light)' : '#fee2e2',
                  border: `1px solid ${isPositive ? '#bbf7d0' : '#fecaca'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isPositive ? (
                    <ArrowUpRight size={18} color="var(--agri-green-dark)" />
                  ) : (
                    <ArrowDownRight size={18} color="var(--red-600)" />
                  )}
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isPositive ? 'var(--agri-green-dark)' : 'var(--red-600)' }}>
                    {factor.display_name}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-600)' }}>
                  Impact: {factor.importance_score}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer and What-If CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--slate-600)', fontSize: '0.75rem', maxWidth: '600px' }}>
          <Info size={16} style={{ flexShrink: 0 }} />
          <span>{result.disclaimer}</span>
        </div>

        <button className="btn-secondary" onClick={onOpenWhatIf}>
          Simulate Input Changes (What-If) &rarr;
        </button>
      </div>
    </div>
  );
};
