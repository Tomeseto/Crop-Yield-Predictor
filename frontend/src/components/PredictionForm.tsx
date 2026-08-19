import React from 'react';
import { Send, RotateCcw } from 'lucide-react';

export interface FarmFormData {
  district: string;
  soil_type: string;
  season: string;
  crop: string;
  area_hectares: number;
  nitrogen_kgha: number;
  phosphorus_kgha: number;
  potassium_kgha: number;
  soil_ph: number;
  organic_carbon_pct: number;
  rainfall_mm: number;
  temperature_celsius: number;
  irrigation_type: string;
}

interface PredictionFormProps {
  formData: FarmFormData;
  setFormData: React.Dispatch<React.SetStateAction<FarmFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  districtsList: Array<{ name: string; zone: string; default_soil: string; avg_rainfall_mm: number }>;
  cropsList: Array<{ name: string; season: string; category: string }>;
  soilTypesList: string[];
}

export const PredictionForm: React.FC<PredictionFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  districtsList,
  cropsList,
  soilTypesList
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dName = e.target.value;
    const found = districtsList.find(d => d.name === dName);
    setFormData(prev => ({
      ...prev,
      district: dName,
      soil_type: found ? found.default_soil : prev.soil_type,
      rainfall_mm: found ? found.avg_rainfall_mm : prev.rainfall_mm
    }));
  };

  const handleReset = () => {
    setFormData({
      district: 'Bargarh',
      soil_type: 'Alluvial',
      season: 'Kharif',
      crop: 'Paddy (Kharif)',
      area_hectares: 2.0,
      nitrogen_kgha: 90.0,
      phosphorus_kgha: 45.0,
      potassium_kgha: 45.0,
      soil_ph: 6.5,
      organic_carbon_pct: 0.60,
      rainfall_mm: 1250.0,
      temperature_celsius: 28.5,
      irrigation_type: 'Canal'
    });
  };

  return (
    <div className="app-card">
      <div className="card-title">
        <span>Farm Profile & Environmental Input Parameters</span>
      </div>
      <p className="card-subtitle">
        Enter verified plot characteristics, Soil Health Card measurements, and seasonal meteorological parameters.
      </p>

      <form onSubmit={onSubmit}>
        <div className="form-grid">
          {/* Location & Crop Info */}
          <div className="form-group">
            <label className="form-label" htmlFor="district">
              <span>District</span>
              <span className="unit-tag">Odisha Zone</span>
            </label>
            <select
              id="district"
              name="district"
              className="form-control"
              value={formData.district}
              onChange={handleDistrictChange}
              required
            >
              {districtsList.map(d => (
                <option key={d.name} value={d.name}>{d.name} ({d.zone})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="crop">
              <span>Target Crop</span>
              <span className="unit-tag">Variety</span>
            </label>
            <select
              id="crop"
              name="crop"
              className="form-control"
              value={formData.crop}
              onChange={handleChange}
              required
            >
              {cropsList.map(c => (
                <option key={c.name} value={c.name}>{c.name} ({c.season})</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="soil_type">
              <span>Soil Classification</span>
              <span className="unit-tag">Profile</span>
            </label>
            <select
              id="soil_type"
              name="soil_type"
              className="form-control"
              value={formData.soil_type}
              onChange={handleChange}
              required
            >
              {soilTypesList.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="season">
              <span>Cropping Season</span>
            </label>
            <select
              id="season"
              name="season"
              className="form-control"
              value={formData.season}
              onChange={handleChange}
              required
            >
              <option value="Kharif">Kharif (Monsoon / Autumn)</option>
              <option value="Rabi">Rabi (Winter / Spring)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="area_hectares">
              <span>Cultivated Land Area</span>
              <span className="unit-tag">Hectares (ha)</span>
            </label>
            <input
              id="area_hectares"
              name="area_hectares"
              type="number"
              step="0.1"
              min="0.1"
              max="50.0"
              className="form-control"
              value={formData.area_hectares}
              onChange={handleChange}
              required
            />
            <span className="form-help">1 Hectare ≈ 2.47 Acres</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="irrigation_type">
              <span>Irrigation Source</span>
            </label>
            <select
              id="irrigation_type"
              name="irrigation_type"
              className="form-control"
              value={formData.irrigation_type}
              onChange={handleChange}
              required
            >
              <option value="Canal">Canal (Major/Medium Command)</option>
              <option value="Borewell">Borewell / Lift Irrigation</option>
              <option value="Rainfed">Rainfed (No Supplemental Irrigation)</option>
            </select>
          </div>

          {/* Soil Chemistry (NPK, pH, OC) */}
          <div className="form-group">
            <label className="form-label" htmlFor="nitrogen_kgha">
              <span>Nitrogen (N)</span>
              <span className="unit-tag">kg / hectare</span>
            </label>
            <input
              id="nitrogen_kgha"
              name="nitrogen_kgha"
              type="number"
              step="1"
              min="0"
              max="350"
              className="form-control"
              value={formData.nitrogen_kgha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phosphorus_kgha">
              <span>Phosphorus (P₂O₅)</span>
              <span className="unit-tag">kg / hectare</span>
            </label>
            <input
              id="phosphorus_kgha"
              name="phosphorus_kgha"
              type="number"
              step="1"
              min="0"
              max="200"
              className="form-control"
              value={formData.phosphorus_kgha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="potassium_kgha">
              <span>Potassium (K₂O)</span>
              <span className="unit-tag">kg / hectare</span>
            </label>
            <input
              id="potassium_kgha"
              name="potassium_kgha"
              type="number"
              step="1"
              min="0"
              max="200"
              className="form-control"
              value={formData.potassium_kgha}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="soil_ph">
              <span>Soil Reaction (pH)</span>
              <span className="unit-tag">pH scale (3.5 - 9.5)</span>
            </label>
            <input
              id="soil_ph"
              name="soil_ph"
              type="number"
              step="0.1"
              min="3.5"
              max="9.5"
              className="form-control"
              value={formData.soil_ph}
              onChange={handleChange}
              required
            />
            <span className="form-help">Acidic &lt; 6.0 | Neutral 6.5-7.5</span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="organic_carbon_pct">
              <span>Organic Carbon (OC)</span>
              <span className="unit-tag">% in soil</span>
            </label>
            <input
              id="organic_carbon_pct"
              name="organic_carbon_pct"
              type="number"
              step="0.01"
              min="0.05"
              max="3.0"
              className="form-control"
              value={formData.organic_carbon_pct}
              onChange={handleChange}
              required
            />
          </div>

          {/* Meteorological Parameters */}
          <div className="form-group">
            <label className="form-label" htmlFor="rainfall_mm">
              <span>Seasonal Rainfall</span>
              <span className="unit-tag">Millimeters (mm)</span>
            </label>
            <input
              id="rainfall_mm"
              name="rainfall_mm"
              type="number"
              step="10"
              min="0"
              max="5000"
              className="form-control"
              value={formData.rainfall_mm}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="temperature_celsius">
              <span>Mean Temperature</span>
              <span className="unit-tag">Degrees Celsius (°C)</span>
            </label>
            <input
              id="temperature_celsius"
              name="temperature_celsius"
              type="number"
              step="0.5"
              min="10.0"
              max="50.0"
              className="form-control"
              value={formData.temperature_celsius}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-secondary" onClick={handleReset} disabled={isLoading}>
            <RotateCcw size={16} />
            <span>Reset to Defaults</span>
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            <Send size={16} />
            <span>{isLoading ? 'Generating Prediction...' : 'Generate Yield Forecast'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
