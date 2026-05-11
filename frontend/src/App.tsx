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
  const [stats, setStats] = useState({ tickets: 0, assets: 0 });

  useEffect(() => {
    axios.get('/api/stats').then(res => setStats(res.data));
  }, []);

  return (
    <div className="container mt-5">
      <div className="cyber-card cyber-border-glow text-center">
        <h2 className="cyber-title mb-4">Command Center</h2>
        <div className="row">
          <div className="col-md-6 mb-3">
            <div className="p-4 border border-secondary rounded">
              <h5 className="text-uppercase text-info mb-3">Total Security Incidents</h5>
              <h2 className="display-4 fw-bold text-white">{stats.tickets.toLocaleString()}</h2>
              <p className="text-muted small">High-volume threat database active</p>
            </div>
          </div>
          <div className="col-md-6 mb-3">
            <div className="p-4 border border-secondary rounded">
              <h5 className="text-uppercase text-info mb-3">Monitored Network Assets</h5>
              <h2 className="display-4 fw-bold text-white">{stats.assets.toLocaleString()}</h2>
              <p className="text-muted small">Real-time infrastructure tracking</p>
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
            <Route path="/assets" element={
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
