import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ImpactMap } from './components/ImpactMap';
import { DonorView } from './components/DonorView';
import { CampaignView } from './components/CampaignView';
import { Testimonials } from './components/Testimonials';
import { FeedbackForm } from './components/FeedbackForm';
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
            <Route path="/campaigns" element={<CampaignView />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/feedback" element={<FeedbackForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;