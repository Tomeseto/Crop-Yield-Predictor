import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sliders, TrendingUp, TrendingDown, DollarSign, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { FarmFormData } from './PredictionForm';
import { PRESET_SCENARIOS, ScenarioPreset } from './ScenarioPresets';

interface WhatIfSimulatorProps {
  baseInputs: FarmFormData;
  onUpdateBaseInputs?: (data: FarmFormData) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  baseInputs,
  onUpdateBaseInputs
}) => {
  const [modified, setModified] = useState<FarmFormData>({ ...baseInputs });
  const [simResult, setSimResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>('bargarh-paddy');

  // Sync if baseInputs change externally
  useEffect(() => {
    setModified({ ...baseInputs });
  }, [baseInputs]);

  // Run simulation whenever modified inputs change (with 300ms debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      runSimulation();
    }, 300);
    return () => clearTimeout(timer);
  }, [modified, baseInputs]);

  const runSimulation = async () => {
    setError(null);
    try {
      const res = await axios.post('/api/simulate/what-if', {
        base_inputs: baseInputs,
        modified_inputs: modified
      });
      if (res.data && res.data.success) {
        setSimResult(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Simulation failed to run.');
    }
  };

  const handleSliderChange = (field: keyof FarmFormData, val: number) => {
    setModified(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleReset = () => {
    setModified({ ...baseInputs });
  };

  const handleSelectPreset = (preset: ScenarioPreset) => {
    setActivePresetId(preset.id);
    if (onUpdateBaseInputs) {
      onUpdateBaseInputs(preset.data);
    }
    setModified({ ...preset.data });
  };

  const isPositiveDelta = simResult && simResult.yield_delta_qha >= 0;

  return (
    <div className="app-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div className="card-title">
          <Sliders size={20} color="var(--agri-green)" />
          <span>Interactive "What-If" Scenario Simulator</span>
        </div>
        <button className="btn-secondary" onClick={handleReset} style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
          <RefreshCw size={14} />
          <span>Reset Sliders</span>
        </button>
      </div>

      <p className="card-subtitle">
        Adjust input parameters to evaluate real-time model response and economic trade-offs (calibrated against MSP & input costs).
      </p>

      {/* Preset Showcase Bar */}
      <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem', backgroundColor: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-700)' }}>
          <Sparkles size={15} color="var(--agri-green)" />
          <span>Load Showcase Scenario Preset:</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={activePresetId === preset.id ? 'btn-primary' : 'btn-secondary'}
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
            >
              {preset.title.split(' ')[0]} - {preset.crop}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Comparison Display Banner */}
      {simResult && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem', backgroundColor: '#ffffff', padding: '1rem', borderRadius: '8px', border: '1.5px solid var(--slate-200)', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', fontWeight: 600 }}>BASELINE YIELD</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--slate-700)' }}>
              {simResult.base_yield_qha} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>q/ha</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
              {baseInputs.crop} ({baseInputs.district})
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', fontWeight: 600 }}>SCENARIO YIELD</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              {simResult.scenario_yield_qha} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>q/ha</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
              Model-evaluated estimate
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', fontWeight: 600 }}>YIELD DIFFERENTIAL (Δ)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: isPositiveDelta ? 'var(--agri-green)' : 'var(--red-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              {isPositiveDelta ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              <span>{isPositiveDelta ? `+${simResult.yield_delta_qha}` : simResult.yield_delta_qha} q/ha</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)' }}>
              ({simResult.percentage_change_pct > 0 ? `+${simResult.percentage_change_pct}` : simResult.percentage_change_pct}%)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--slate-600)', fontWeight: 600 }}>ESTIMATED NET GAIN / LOSS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: simResult.economic_impact?.estimated_net_gain_inr >= 0 ? 'var(--agri-green)' : 'var(--red-600)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <DollarSign size={18} />
              <span>₹{simResult.economic_impact?.estimated_net_gain_inr || 0}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--slate-600)' }}>
              Total for {baseInputs.area_hectares} ha area
            </div>
          </div>
        </div>
      )}

      {/* Sliders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Nitrogen (N) Application</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--agri-green)' }}>{modified.nitrogen_kgha} kg/ha</span>
          </div>
          <input
            type="range"
            min="0"
            max="250"
            step="5"
            value={modified.nitrogen_kgha}
            onChange={(e) => handleSliderChange('nitrogen_kgha', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--agri-green)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--slate-600)' }}>
            <span>0 kg/ha</span>
            <span>Base: {baseInputs.nitrogen_kgha}</span>
            <span>250 kg/ha</span>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Phosphorus (P₂O₅) Application</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--agri-green)' }}>{modified.phosphorus_kgha} kg/ha</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={modified.phosphorus_kgha}
            onChange={(e) => handleSliderChange('phosphorus_kgha', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--agri-green)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--slate-600)' }}>
            <span>0 kg/ha</span>
            <span>Base: {baseInputs.phosphorus_kgha}</span>
            <span>120 kg/ha</span>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Potassium (K₂O) Application</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--agri-green)' }}>{modified.potassium_kgha} kg/ha</span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="5"
            value={modified.potassium_kgha}
            onChange={(e) => handleSliderChange('potassium_kgha', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--agri-green)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--slate-600)' }}>
            <span>0 kg/ha</span>
            <span>Base: {baseInputs.potassium_kgha}</span>
            <span>120 kg/ha</span>
          </div>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Seasonal Rainfall / Water</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--agri-green)' }}>{modified.rainfall_mm} mm</span>
          </div>
          <input
            type="range"
            min="50"
            max="2500"
            step="25"
            value={modified.rainfall_mm}
            onChange={(e) => handleSliderChange('rainfall_mm', parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--agri-green)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--slate-600)' }}>
            <span>50 mm</span>
            <span>Base: {baseInputs.rainfall_mm}</span>
            <span>2500 mm</span>
          </div>
        </div>
      </div>
    </div>
  );
};
