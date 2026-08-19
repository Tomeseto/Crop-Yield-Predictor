import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Calendar, Sparkles, BookOpen } from 'lucide-react';
import { FarmFormData } from './PredictionForm';
import { UIStateWrapper } from './UIStateWrapper';

interface FertilizerAdvisoryProps {
  farmData: FarmFormData;
}

export const FertilizerAdvisory: React.FC<FertilizerAdvisoryProps> = ({ farmData }) => {
  const [optData, setOptData] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    fetchOptimization();
  }, [farmData.district, farmData.crop, farmData.area_hectares, farmData.soil_ph]);

  const fetchOptimization = async () => {
    setStatus('loading');
    try {
      const payload = {
        district: farmData.district,
        soil_type: farmData.soil_type,
        season: farmData.season,
        crop: farmData.crop,
        area_hectares: farmData.area_hectares,
        current_soil_ph: farmData.soil_ph,
        current_oc_pct: farmData.organic_carbon_pct,
        expected_rainfall_mm: farmData.rainfall_mm,
        avg_temperature_celsius: farmData.temperature_celsius,
        irrigation_type: farmData.irrigation_type
      };

      const res = await axios.post('/api/recommendations/optimize', payload);
      if (res.data && res.data.success) {
        setOptData(res.data);
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg('Could not compute optimal fertilizer schedule.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.response?.data?.error || err.message || 'Error fetching optimization.');
    }
  };

  return (
    <div className="app-card">
      <div className="card-title">
        <Sparkles size={20} color="var(--agri-green)" />
        <span>Prescriptive Nutrient Optimization & Sowing Schedule</span>
      </div>
      <p className="card-subtitle">
        Scientifically calibrated fertilizer quantities (Urea, DAP, MOP) based on OUAT package of practices and Soil Health Card critical limits.
      </p>

      <UIStateWrapper
        status={status}
        loadingText="Solving constrained mathematical optimization for optimal N-P-K..."
        errorMessage={errorMsg}
        onRetry={fetchOptimization}
      >
        {optData && (
          <div>
            {/* Commercial Fertilizer Bags Summary */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Package size={16} color="var(--agri-green)" />
                <span>Total Commercial Fertilizer Requirements for {farmData.area_hectares} Hectare(s)</span>
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div className="metric-box" style={{ textAlign: 'left', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 600 }}>UREA (46% N)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                    {optData.commercial_fertilizer_summary?.urea_bags_total || 0} <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>Bags (45kg)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                    Supplies remaining Nitrogen
                  </div>
                </div>

                <div className="metric-box" style={{ textAlign: 'left', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 600 }}>DAP (18-46-0)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                    {optData.commercial_fertilizer_summary?.dap_bags_total || 0} <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>Bags (50kg)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                    Supplies 100% Phosphorus + starter N
                  </div>
                </div>

                <div className="metric-box" style={{ textAlign: 'left', padding: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', fontWeight: 600 }}>MOP (60% K₂O)</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                    {optData.commercial_fertilizer_summary?.mop_bags_total || 0} <span style={{ fontSize: '0.85rem', fontWeight: 400 }}>Bags (50kg)</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', marginTop: '0.25rem' }}>
                    Supplies 100% Potassium
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                <span>Optimal Dose: <strong>{optData.optimal_nitrogen_kgha} N : {optData.optimal_phosphorus_kgha} P₂O₅ : {optData.optimal_potassium_kgha} K₂O (kg/ha)</strong></span>
                <span>Est. Fertilizer Cost: <strong>₹{optData.commercial_fertilizer_summary?.estimated_fertilizer_cost_inr || 0}</strong></span>
              </div>
            </div>

            {/* Split Application Schedule Timeline */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} color="var(--agri-green)" />
                <span>Recommended Split Application & Agronomic Timeline</span>
              </h4>

              {optData.schedule?.map((stage: any, idx: number) => (
                <div key={idx} className="timeline-item">
                  <div className="timeline-marker">{idx + 1}</div>
                  <div className="timeline-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)' }}>{stage.stage_name}</strong>
                      <span className="badge-amber">{stage.timing}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--slate-700)', margin: '0.4rem 0' }}>
                      {stage.urea_bags > 0 && <span><strong>Urea:</strong> {stage.urea_bags} bags</span>}
                      {stage.dap_bags > 0 && <span><strong>DAP:</strong> {stage.dap_bags} bags</span>}
                      {stage.mop_bags > 0 && <span><strong>MOP:</strong> {stage.mop_bags} bags</span>}
                    </div>

                    <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>{stage.notes}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={16} />
              <span>{optData.agronomic_reference_note}</span>
            </div>
          </div>
        )}
      </UIStateWrapper>
    </div>
  );
};
