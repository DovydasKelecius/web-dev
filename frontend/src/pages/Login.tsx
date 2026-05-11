import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-4">
          <div className="cyber-card cyber-border-glow">
            <h3 className="cyber-title mb-4">Access Terminal</h3>
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label className="form-label small">Username</label>
                <input 
                  type="text" 
                  className="form-control form-control-cyber" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="mb-4">
                <label className="form-label small">Security Code</label>
                <input 
                  type="password" 
                  className="form-control form-control-cyber" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-cyber w-100">AUTHENTICATE</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
