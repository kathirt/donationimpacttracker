import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ImpactMap } from './components/ImpactMap';
import { DonorView } from './components/DonorView';
import { CampaignView } from './components/CampaignView';
import './App.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/map" element={<ImpactMap />} />
                <Route path="/donors" element={<DonorView />} />
                <Route path="/campaigns" element={<CampaignView />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;