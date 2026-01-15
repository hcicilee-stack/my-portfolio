import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { PortfolioData, Profile, Project } from './types';
import { INITIAL_DATA } from './constants';
import PortfolioView from './components/PortfolioView';
import AdminView from './components/AdminView';
import BackgroundMusic from './components/BackgroundMusic';

const App: React.FC = () => {
  const [data, setData] = useState<PortfolioData>(() => {
    const saved = localStorage.getItem('portfolio_data');
    if (!saved) return INITIAL_DATA;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.profile && Array.isArray(parsed.projects)) {
        return parsed;
      }
      return INITIAL_DATA;
    } catch (e) {
      console.error("Data restoration failed:", e);
      return INITIAL_DATA;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('portfolio_data', JSON.stringify(data));
    } catch (e) {
      console.warn("LocalStorage full, please export your data manually.");
    }
  }, [data]);

  const updateProfile = (p: Profile) => setData(prev => ({ ...prev, profile: p }));
  const updateCategories = (c: string[]) => setData(prev => ({ ...prev, categories: c }));
  const updateProjects = (p: Project[]) => setData(prev => ({ ...prev, projects: p }));

  return (
    <Router>
      <div className="min-h-screen relative selection:bg-[#9e2a2a] selection:text-white">
        <BackgroundMusic />
        <Routes>
          <Route path="/" element={<PortfolioView data={data} />} />
          <Route path="/admin" element={<AdminView data={data} updateProfile={updateProfile} updateCategories={updateCategories} updateProjects={updateProjects} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
