import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ImpactMap } from './components/ImpactMap';
import { DonorView } from './components/DonorView';
import { DonorProfile } from './components/DonorProfile';
import { CreateDonorProfile } from './components/CreateDonorProfile';
import { CampaignView } from './components/CampaignView';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<ImpactMap />} />
            <Route path="/donors" element={<DonorView />} />
            <Route path="/donors/create" element={<CreateDonorProfile />} />
            <Route path="/donors/:donorId" element={<DonorProfile />} />
            <Route path="/campaigns" element={<CampaignView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;