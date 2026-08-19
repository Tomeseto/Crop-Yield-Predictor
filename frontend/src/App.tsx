import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Header } from './components/Header';
import { PredictionForm, FarmFormData } from './components/PredictionForm';
import { ResultCard, PredictionResultData } from './components/ResultCard';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { FertilizerAdvisory } from './components/FertilizerAdvisory';
import { HistoryView } from './components/HistoryView';
import { UIStateWrapper } from './components/UIStateWrapper';
import { ScenarioPresets, ScenarioPreset, PRESET_SCENARIOS } from './components/ScenarioPresets';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('predict');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('bargarh-paddy');
  const [districtsData, setDistrictsData] = useState<{
    districts: any[];
    soil_types: string[];
    seasons: string[];
    crops: any[];
  }>({
    districts: [],
    soil_types: ['Alluvial', 'Red Laterite', 'Black Soil', 'Coastal Saline', 'Sandy Loam'],
    seasons: ['Kharif', 'Rabi'],
    crops: []
  });

  const [formData, setFormData] = useState<FarmFormData>(PRESET_SCENARIOS[0].data);
  const [predictionResult, setPredictionResult] = useState<PredictionResultData | null>(null);
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const [formError, setFormError] = useState<string>('');

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const res = await axios.get('/api/districts');
      if (res.data) {
        setDistrictsData({
          districts: res.data.districts || [],
          soil_types: res.data.soil_types || ['Alluvial', 'Red Laterite', 'Black Soil', 'Coastal Saline', 'Sandy Loam'],
          seasons: res.data.seasons || ['Kharif', 'Rabi'],
          crops: res.data.crops || []
        });
      }
    } catch (err) {
      console.warn('Could not load districts master data dynamically; using local defaults.');
    }
  };

  const handleSelectPreset = (preset: ScenarioPreset) => {
    setSelectedPresetId(preset.id);
    setFormData(preset.data);
    setPredictionResult(null);
    setFormStatus('idle');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('loading');
    setFormError('');
    try {
      const res = await axios.post('/api/predictions', formData);
      if (res.data && res.data.success) {
        setPredictionResult(res.data);
        setFormStatus('success');
      } else {
        setFormStatus('error');
        setFormError('Failed to receive prediction result from server.');
      }
    } catch (err: any) {
      setFormStatus('error');
      const msg = err.response?.data?.error || err.response?.data?.details?.[0]?.message || err.message || 'Error occurred during prediction';
      setFormError(msg);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          {/* Tab 1: Yield Predictor */}
          {activeTab === 'predict' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <ScenarioPresets
                onSelectPreset={handleSelectPreset}
                selectedPresetId={selectedPresetId}
              />

              <PredictionForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFormSubmit}
                isLoading={formStatus === 'loading'}
                districtsList={districtsData.districts.length ? districtsData.districts : [
                  { name: 'Bargarh', zone: 'Western Central Table Land', default_soil: 'Alluvial', avg_rainfall_mm: 1300 },
                  { name: 'Cuttack', zone: 'East & South Eastern Coastal Plain', default_soil: 'Alluvial', avg_rainfall_mm: 1450 },
                  { name: 'Kalahandi', zone: 'Western Undulating Zone', default_soil: 'Red Laterite', avg_rainfall_mm: 1100 },
                  { name: 'Balasore', zone: 'North Eastern Coastal Plain', default_soil: 'Alluvial', avg_rainfall_mm: 1550 },
                  { name: 'Sundargarh', zone: 'North Western Plateau', default_soil: 'Red Laterite', avg_rainfall_mm: 1350 },
                  { name: 'Koraput', zone: 'Eastern Ghat High Land', default_soil: 'Red Laterite', avg_rainfall_mm: 1400 }
                ]}
                cropsList={districtsData.crops.length ? districtsData.crops : [
                  { name: 'Paddy (Kharif)', season: 'Kharif', category: 'Cereals' },
                  { name: 'Paddy (Rabi)', season: 'Rabi', category: 'Cereals' },
                  { name: 'Ragi (Mandia)', season: 'Kharif', category: 'Millets' },
                  { name: 'Green Gram (Moong)', season: 'Rabi', category: 'Pulses' },
                  { name: 'Groundnut', season: 'Kharif', category: 'Oilseeds' },
                  { name: 'Maize', season: 'Kharif', category: 'Coarse Cereals' },
                  { name: 'Mustard', season: 'Rabi', category: 'Oilseeds' }
                ]}
                soilTypesList={districtsData.soil_types}
              />

              {formStatus === 'error' && (
                <UIStateWrapper status="error" errorMessage={formError} onRetry={() => setFormStatus('idle')}>
                  <div></div>
                </UIStateWrapper>
              )}

              {predictionResult && (
                <ResultCard
                  result={predictionResult}
                  cropName={formData.crop}
                  district={formData.district}
                  areaHa={formData.area_hectares}
                  onOpenWhatIf={() => setActiveTab('whatif')}
                />
              )}
            </div>
          )}

          {/* Tab 2: What-If Simulator */}
          {activeTab === 'whatif' && (
            <WhatIfSimulator
              baseInputs={formData}
              onUpdateBaseInputs={setFormData}
            />
          )}

          {/* Tab 3: Prescriptive Fertilizer Advisory */}
          {activeTab === 'optimize' && (
            <FertilizerAdvisory farmData={formData} />
          )}

          {/* Tab 4: Prediction Logs & History */}
          {activeTab === 'history' && (
            <HistoryView />
          )}
        </div>
      </main>

      <footer style={{ backgroundColor: '#0f172a', color: '#94a3b8', padding: '1.5rem 0', fontSize: '0.8rem', borderTop: '1px solid #1e293b', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <strong>KrushiDoot AI Platform</strong> • Built for Department of Agriculture & Farmers' Empowerment, Government of Odisha.
          </div>
          <div>
            Calibrated on OUAT Package of Practices & Empirical Agricultural Statistics.
          </div>
        </div>
      </footer>
    </div>
  );
};
