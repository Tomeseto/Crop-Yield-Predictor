import React from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { FarmFormData } from './PredictionForm';

export interface ScenarioPreset {
  id: string;
  title: string;
  badge: string;
  district: string;
  crop: string;
  description: string;
  data: FarmFormData;
}

export const PRESET_SCENARIOS: ScenarioPreset[] = [
  {
    id: 'bargarh-paddy',
    title: 'Bargarh Canal-Irrigated Paddy',
    badge: 'Rice Bowl • Optimal Zone',
    district: 'Bargarh',
    crop: 'Paddy (Kharif)',
    description: 'High-productivity alluvial canal command area under Hirakud irrigation system.',
    data: {
      district: 'Bargarh',
      soil_type: 'Alluvial',
      season: 'Kharif',
      crop: 'Paddy (Kharif)',
      area_hectares: 2.5,
      nitrogen_kgha: 95.0,
      phosphorus_kgha: 45.0,
      potassium_kgha: 45.0,
      soil_ph: 6.8,
      organic_carbon_pct: 0.65,
      rainfall_mm: 1300.0,
      temperature_celsius: 28.5,
      irrigation_type: 'Canal'
    }
  },
  {
    id: 'kalahandi-ragi',
    title: 'Kalahandi Rainfed Mandia (Millets)',
    badge: 'KBK Belt • Rainfed Millet',
    district: 'Kalahandi',
    crop: 'Ragi (Mandia)',
    description: 'Odisha Millets Mission upland cultivation under water-stress prone conditions.',
    data: {
      district: 'Kalahandi',
      soil_type: 'Red Laterite',
      season: 'Kharif',
      crop: 'Ragi (Mandia)',
      area_hectares: 1.5,
      nitrogen_kgha: 45.0,
      phosphorus_kgha: 22.0,
      potassium_kgha: 22.0,
      soil_ph: 5.8,
      organic_carbon_pct: 0.42,
      rainfall_mm: 880.0,
      temperature_celsius: 30.5,
      irrigation_type: 'Rainfed'
    }
  },
  {
    id: 'sundargarh-mustard',
    title: 'Sundargarh Acidic Soil Mustard',
    badge: 'North Plateau • Acidic Soil',
    district: 'Sundargarh',
    crop: 'Mustard',
    description: 'Rabi oilseed crop in acidic red-laterite soil (pH 5.2) with limited phosphorus mobility.',
    data: {
      district: 'Sundargarh',
      soil_type: 'Red Laterite',
      season: 'Rabi',
      crop: 'Mustard',
      area_hectares: 1.2,
      nitrogen_kgha: 55.0,
      phosphorus_kgha: 25.0,
      potassium_kgha: 25.0,
      soil_ph: 5.2,
      organic_carbon_pct: 0.45,
      rainfall_mm: 140.0,
      temperature_celsius: 23.0,
      irrigation_type: 'Borewell'
    }
  },
  {
    id: 'cuttack-moong',
    title: 'Cuttack Delta Green Gram (Moong)',
    badge: 'Coastal Delta • High MSP Pulse',
    district: 'Cuttack',
    crop: 'Green Gram (Moong)',
    description: 'Post-kharif rice-fallow pulse crop utilizing residual coastal soil moisture.',
    data: {
      district: 'Cuttack',
      soil_type: 'Alluvial',
      season: 'Rabi',
      crop: 'Green Gram (Moong)',
      area_hectares: 3.0,
      nitrogen_kgha: 20.0,
      phosphorus_kgha: 40.0,
      potassium_kgha: 20.0,
      soil_ph: 6.6,
      organic_carbon_pct: 0.60,
      rainfall_mm: 180.0,
      temperature_celsius: 25.0,
      irrigation_type: 'Borewell'
    }
  }
];

interface ScenarioPresetsProps {
  onSelectPreset: (preset: ScenarioPreset) => void;
  selectedPresetId?: string;
}

export const ScenarioPresets: React.FC<ScenarioPresetsProps> = ({
  onSelectPreset,
  selectedPresetId
}) => {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
        <Sparkles size={16} color="var(--agri-green)" />
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>
          Odisha Agro-Climatic Showcase Scenarios (1-Click Demo Presets)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
        {PRESET_SCENARIOS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              style={{
                textAlign: 'left',
                padding: '0.75rem 0.9rem',
                backgroundColor: isSelected ? 'var(--agri-green-light)' : '#ffffff',
                border: `1.5px solid ${isSelected ? 'var(--agri-green)' : 'var(--slate-200)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? '0 2px 4px rgba(21, 128, 61, 0.15)' : '0 1px 2px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                <strong style={{ fontSize: '0.85rem', color: isSelected ? 'var(--agri-green-dark)' : 'var(--slate-900)' }}>
                  {preset.title}
                </strong>
                <Bookmark size={14} color={isSelected ? 'var(--agri-green)' : 'var(--slate-600)'} />
              </div>
              <span className="badge-amber" style={{ fontSize: '0.7rem', padding: '0.15rem 0.4rem', display: 'inline-block', marginBottom: '0.35rem' }}>
                {preset.badge}
              </span>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-600)', lineHeight: '1.3' }}>
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
