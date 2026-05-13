import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light navbar-custom">
      <div className="container">
        <Link className="navbar-brand" to="/">CyberGuard</Link>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            {token && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/tickets">Tickets</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/network-assets">Assets</Link>
                </li>
                {role === 'admin' && (
                  <li className="nav-item">
                    <Link className="nav-link" to="/logs">Logs</Link>
                  </li>
                )}
              </>
            )}
          </ul>
          <div className="d-flex align-items-center">
            {token ? (
              <>
                <span className="text-primary fw-bold me-3">[{role?.toUpperCase() || 'UNKNOWN'}]</span>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <Link className="btn btn-custom btn-sm" to="/login">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
