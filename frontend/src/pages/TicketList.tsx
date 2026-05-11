import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Ticket {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  asset: { hostname: string; ip_address: string; asset_type: string };
}

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const role = localStorage.getItem('role');

  useEffect(() => {
    fetchTickets();
  }, [page]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/tickets?page=${page}`);
      setTickets(res.data.data || []);
      setTotalPages(res.data.last || 1);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this incident record?')) return;
    await axios.delete(`/api/tickets/delete?id=${id}`);
    fetchTickets();
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="cyber-title">Security Incidents</h2>
        <span className="text-muted">Page {page} of {totalPages}</span>
      </div>

      <div className="cyber-card">
        <table className="table table-dark table-cyber">
          <thead>
            <tr>
              <th>ID</th>
              <th>Incident Title</th>
              <th>Asset</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center">Loading Feed...</td></tr>
            ) : (
              tickets.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.title}</td>
                  <td>{t.asset?.hostname}</td>
                  <td>
                    <span className={`badge ${t.severity === 'Critical' ? 'badge-critical' : 'bg-warning'}`}>
                      {t.severity}
                    </span>
                  </td>
                  <td>{t.status}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info me-2" onClick={() => setSelectedTicket(t)}>View</button>
                    {role === 'admin' && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t.id)}>Purge</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(1)}>FIRST</button>
            </li>
            <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => p - 1)}>PREV</button>
            </li>
            <li className="page-item disabled"><span className="page-link">{page} / {totalPages}</span></li>
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(p => p + 1)}>NEXT</button>
            </li>
            <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPage(totalPages)}>LAST</button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Ticket View Modal */}
      {selectedTicket && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content cyber-card cyber-border-glow">
              <div className="modal-header border-secondary">
                <h5 className="modal-title cyber-title">Incident Details #{selectedTicket.id}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTicket(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <p><strong>Title:</strong> {selectedTicket.title}</p>
                    <p><strong>Severity:</strong> <span className={`badge ${selectedTicket.severity === 'Critical' ? 'badge-critical' : 'bg-warning'}`}>{selectedTicket.severity}</span></p>
                    <p><strong>Status:</strong> {selectedTicket.status}</p>
                  </div>
                  <div className="col-md-6">
                    <p><strong>Asset:</strong> {selectedTicket.asset?.hostname}</p>
                    <p><strong>IP:</strong> {selectedTicket.asset?.ip_address}</p>
                    <p><strong>Created:</strong> {new Date(selectedTicket.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <hr className="border-secondary" />
                <p><strong>Full Description:</strong></p>
                <div className="p-3 bg-dark rounded border border-secondary">
                  {selectedTicket.description}
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedTicket(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketList;
