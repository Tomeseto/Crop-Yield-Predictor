import React from 'react';
import { Sprout, TrendingUp, Sliders, Database } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'predict', label: 'Yield Predictor', icon: Sprout },
    { id: 'whatif', label: 'What-If Simulator', icon: Sliders },
    { id: 'optimize', label: 'Fertilizer Advisory', icon: TrendingUp },
    { id: 'history', label: 'Prediction Logs', icon: Database },
  ];

  return (
    <>
      <div className="gov-top-strip">
        <div className="container">
          <span>Government of Odisha • Department of Agriculture & Farmers' Empowerment</span>
          <span>KrushiDoot AI System (v1.0)</span>
        </div>
      </div>

      <header className="main-header">
        <div className="container header-inner">
          <div className="brand-wrapper">
            <div className="brand-logo-badge">
              <Sprout size={26} />
            </div>
            <div className="brand-text">
              <h1>KrushiDoot AI</h1>
              <p>Predictive Crop Yield Forecasting & Prescriptive Nutrient Optimization</p>
            </div>
          </div>

          <nav className="nav-tabs" aria-label="Main Navigation">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`nav-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={16} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
};
