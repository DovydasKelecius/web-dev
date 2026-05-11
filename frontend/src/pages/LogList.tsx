import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LogEntry {
  id: number;
  timestamp: string;
  level: string;
  source: string;
  message: string;
  user_id: number;
}

const LogList: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/logs');
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="cyber-title mb-4">System Security Logs</h2>
      <div className="cyber-card">
        <table className="table table-dark table-cyber">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Level</th>
              <th>Source</th>
              <th>Message</th>
              <th>User ID</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center">Retrieving encrypted logs...</td></tr>
            ) : (
              logs.map(log => (
                <tr key={log.id}>
                  <td className="small">{new Date(log.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${log.level === 'ERROR' ? 'bg-danger' : log.level === 'WARN' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                      {log.level}
                    </span>
                  </td>
                  <td>{log.source}</td>
                  <td>{log.message}</td>
                  <td>{log.user_id || 'SYSTEM'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogList;
