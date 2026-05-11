import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import TicketList from './pages/TicketList';
import AssetList from './pages/AssetList';
import LogList from './pages/LogList';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ tickets: 0, assets: 0, open: 0, in_progress: 0, resolved: 0 });

  useEffect(() => {
    axios.get('/api/stats').then(res => setStats(res.data));
  }, []);

  return (
    <div className="container mt-5">
      <div className="cyber-card cyber-border-glow text-center">
        <h2 className="cyber-title mb-4">Command Center</h2>
        
        {/* Main Stats */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3">
            <div className="p-4 border border-secondary rounded">
              <h5 className="text-uppercase text-info mb-3">Total Incidents</h5>
              <h2 className="display-4 fw-bold text-white">{stats.tickets.toLocaleString()}</h2>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="p-4 border border-secondary rounded">
              <h5 className="text-uppercase text-info mb-3">Monitored Assets</h5>
              <h2 className="display-4 fw-bold text-white">{stats.assets.toLocaleString()}</h2>
            </div>
          </div>
        </div>

        {/* Detailed Status Stats */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="p-3 border border-warning rounded">
              <h6 className="text-warning">OPEN</h6>
              <h3 className="text-white">{stats.open.toLocaleString()}</h3>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="p-3 border border-primary rounded">
              <h6 className="text-primary">IN PROGRESS</h6>
              <h3 className="text-white">{stats.in_progress.toLocaleString()}</h3>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="p-3 border border-success rounded">
              <h6 className="text-success">RESOLVED</h6>
              <h3 className="text-white">{stats.resolved.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="main-container">
        <Header />
        <main className="flex-shrink-0">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <TicketList />
              </ProtectedRoute>
            } />
            <Route path="/network-assets" element={
              <ProtectedRoute>
                <AssetList />
              </ProtectedRoute>
            } />
            <Route path="/logs" element={
              <ProtectedRoute>
                <LogList />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
