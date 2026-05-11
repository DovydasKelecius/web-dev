import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Comment {
  id: number;
  created_at: string;
  user: { username: string };
  content: string;
}

interface HistoryEntry {
  id: number;
  created_at: string;
  action: string;
  user: { username: string };
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  asset: { hostname: string; ip_address: string; asset_type: string };
  comments: Comment[];
  history: HistoryEntry[];
}

interface Asset {
  id: number;
  hostname: string;
}

const TicketList: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchID, setSearchID] = useState('');
  const [jumpPage, setJumpPage] = useState('1');
  const [loading, setLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', severity: 'Medium', status: 'Open', asset_id: 0 });
  const [commentText, setCommentText] = useState('');
  const [errors, setErrors] = useState<any>({});
  
  const role = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, severityFilter, searchID]);

  useEffect(() => {
    if (showCreate) fetchAssets();
  }, [showCreate]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/tickets?page=${page}&status=${statusFilter}&severity=${severityFilter}&id=${searchID}`);
      setTickets(res.data.data || []);
      setTotalPages(res.data.last || 1);
      setJumpPage(String(page));
      
      if (selectedTicket) {
        const current = (res.data.data as Ticket[]).find(t => t.id === selectedTicket.id);
        if (current) setSelectedTicket(current);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchAssets = async () => {
    const res = await axios.get('/api/assets');
    setAssets(res.data || []);
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPage);
    if (p >= 1 && p <= totalPages) {
      setPage(p);
    } else {
      setJumpPage(String(page));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      await axios.post('/api/tickets/create', { ...formData, asset_id: Number(formData.asset_id), reporter_id: Number(userId) });
      setShowCreate(false);
      setPage(1);
      fetchTickets();
    } catch (err: any) {
      if (err.response?.status === 422) setErrors(err.response.data);
    }
  };

  const handleUpdate = async (id: number, payload: any) => {
    try {
      await axios.put(`/api/tickets/update?id=${id}`, payload);
      fetchTickets();
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !selectedTicket) return;
    try {
      await axios.post('/api/comments/create', {
        ticket_id: selectedTicket.id,
        content: commentText,
        user_id: Number(userId)
      });
      setCommentText('');
      fetchTickets();
    } catch (err) {
      console.error("Comment failed", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this incident record?')) return;
    await axios.delete(`/api/tickets/delete?id=${id}`);
    fetchTickets();
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'bg-danger';
      case 'Medium': return 'bg-warning text-dark';
      case 'Low': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="cyber-title">Security Incidents</h2>
        <button className="btn btn-cyber" onClick={() => setShowCreate(true)}>REPORT INCIDENT</button>
      </div>

      <div className="row mb-4 g-2">
        <div className="col-md-3">
          <input type="text" className="form-control form-control-cyber" placeholder="Search by ID..." value={searchID} onChange={(e) => { setSearchID(e.target.value); setPage(1); }} />
        </div>
        <div className="col-md-3">
          <select className="form-select form-control-cyber" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div className="col-md-3">
          <select className="form-select form-control-cyber" value={severityFilter} onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}>
            <option value="">All Severities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        <div className="col-md-3 d-flex align-items-center justify-content-end">
           <span className="text-muted small">Showing {tickets.length} records</span>
        </div>
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
            ) : tickets.length === 0 ? (
              <tr><td colSpan={6} className="text-center">No records found.</td></tr>
            ) : (
              tickets.map(t => (
                <tr key={t.id}>
                  <td>{t.id}</td>
                  <td>{t.title}</td>
                  <td>{t.asset?.hostname}</td>
                  <td><span className={`badge ${getSeverityBadge(t.severity)}`}>{t.severity}</span></td>
                  <td>{t.status}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-info me-2" onClick={() => setSelectedTicket(t)}>View</button>
                    {role === 'admin' && <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(t.id)}>Purge</button>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <nav>
            <ul className="pagination mb-0">
              <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(1)} disabled={page <= 1}>« FIRST</button></li>
              <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>‹ PREV</button></li>
              <li className="page-item disabled"><span className="page-link text-white bg-dark border-secondary">PAGE {page} / {totalPages}</span></li>
              <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>NEXT ›</button></li>
              <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}><button className="page-link" onClick={() => setPage(totalPages)} disabled={page >= totalPages}>LAST »</button></li>
            </ul>
          </nav>
          <form className="d-flex align-items-center" onSubmit={handleJumpPage}>
            <span className="text-muted small me-2">JUMP TO:</span>
            <input type="number" className="form-control form-control-cyber form-control-sm" style={{width: '80px'}} value={jumpPage} onChange={(e) => setJumpPage(e.target.value)} min="1" max={totalPages} />
            <button type="submit" className="btn btn-sm btn-outline-primary ms-2">GO</button>
          </form>
        </div>
      </div>

      {/* Ticket Create Modal */}
      {showCreate && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content cyber-card cyber-border-glow">
              <div className="modal-header border-secondary">
                <h5 className="modal-title cyber-title">Report New Incident</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreate(false)}></button>
              </div>
              <form onSubmit={handleCreate}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small">Incident Title</label>
                    <input className={`form-control form-control-cyber ${errors.title ? 'is-invalid' : ''}`} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                    {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                  </div>
                  <div className="mb-3">
                    <label className="form-label small">Description</label>
                    <textarea className="form-control form-control-cyber" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small">Affected Asset</label>
                      <select className="form-select form-control-cyber" value={formData.asset_id} onChange={e => setFormData({...formData, asset_id: Number(e.target.value)})} required>
                        <option value="">Select Asset...</option>
                        {assets.map(a => <option key={a.id} value={a.id}>{a.hostname}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small">Severity</label>
                      <select className="form-select form-control-cyber" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
                  <button type="submit" className="btn btn-cyber">SUBMIT REPORT</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal with Comments and History */}
      {selectedTicket && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable">
            <div className="modal-content cyber-card cyber-border-glow">
              <div className="modal-header border-secondary">
                <h5 className="modal-title cyber-title">Incident Details #{selectedTicket.id}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedTicket(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-lg-8 border-end border-secondary">
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <p><strong>Title:</strong> {selectedTicket.title}</p>
                        <p><strong>Severity:</strong> <span className={`badge ${getSeverityBadge(selectedTicket.severity)}`}>{selectedTicket.severity}</span></p>
                        <p><strong>Status:</strong> {selectedTicket.status}</p>
                      </div>
                      <div className="col-md-6">
                        <p><strong>Asset:</strong> {selectedTicket.asset?.hostname}</p>
                        <p><strong>IP:</strong> {selectedTicket.asset?.ip_address}</p>
                        <p><strong>Created:</strong> {new Date(selectedTicket.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <p><strong>Full Description:</strong></p>
                    <div className="p-3 bg-dark rounded border border-secondary mb-4">{selectedTicket.description}</div>
                    
                    <h6 className="cyber-title mb-3">Discussion Feed</h6>
                    <div className="mb-4" style={{maxHeight: '300px', overflowY: 'auto'}}>
                      {selectedTicket.comments?.length > 0 ? (
                        selectedTicket.comments.map(c => (
                          <div key={c.id} className="mb-2 p-2 border-start border-primary bg-dark rounded">
                            <div className="d-flex justify-content-between small text-muted mb-1">
                              <strong>{c.user?.username || 'user'}</strong>
                              <span>{new Date(c.created_at).toLocaleString()}</span>
                            </div>
                            <div>{c.content}</div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted small">No comments yet.</p>
                      )}
                    </div>

                    <form onSubmit={handleAddComment} className="mb-4">
                      <div className="input-group">
                        <input type="text" className="form-control form-control-cyber" placeholder="Add detailed information..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                        <button className="btn btn-outline-primary" type="submit">POST</button>
                      </div>
                    </form>

                    {role === 'admin' && (
                      <div className="border border-info p-3 rounded mt-2 bg-dark">
                        <h6 className="text-info mb-3">ADMIN OVERRIDE CONTROLS</h6>
                        <div className="row g-2 mb-3">
                           <div className="col-md-6">
                              <label className="small text-muted d-block mb-1">SET STATUS</label>
                              <div className="btn-group w-100">
                                <button className="btn btn-sm btn-outline-info" onClick={() => handleUpdate(selectedTicket.id, { status: 'In Progress' })}>In Progress</button>
                                <button className="btn btn-sm btn-outline-success" onClick={() => handleUpdate(selectedTicket.id, { status: 'Resolved' })}>Resolve</button>
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => handleUpdate(selectedTicket.id, { status: 'Closed' })}>Close</button>
                              </div>
                           </div>
                           <div className="col-md-6">
                              <label className="small text-muted d-block mb-1">SET SEVERITY</label>
                              <div className="btn-group w-100">
                                <button className="btn btn-sm btn-outline-warning" onClick={() => handleUpdate(selectedTicket.id, { severity: 'Low' })}>Low</button>
                                <button className="btn btn-sm btn-outline-warning" onClick={() => handleUpdate(selectedTicket.id, { severity: 'Medium' })}>Med</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleUpdate(selectedTicket.id, { severity: 'High' })}>High</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleUpdate(selectedTicket.id, { severity: 'Critical' })}>Crit</button>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="col-lg-4">
                    <h6 className="cyber-title mb-3 text-center">Audit Trail</h6>
                    <div className="small" style={{maxHeight: '600px', overflowY: 'auto'}}>
                      {selectedTicket.history?.length > 0 ? (
                        selectedTicket.history.slice().reverse().map(h => (
                          <div key={h.id} className="mb-2 p-2 border border-secondary rounded bg-dark" style={{fontSize: '0.8rem'}}>
                            <div className="text-info mb-1">{h.action}</div>
                            <div className="text-muted d-flex justify-content-between">
                              <span>By: {h.user?.username || 'SYSTEM'}</span>
                              <span>{new Date(h.created_at).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted text-center italic">Initial creation only.</p>
                      )}
                    </div>
                  </div>
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
