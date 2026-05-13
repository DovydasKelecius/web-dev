import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Asset {
  id: number;
  hostname: string;
  ip_address: string;
  asset_type: string;
  criticality: string;
  owner: string;
}

const AssetList: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState({
    hostname: '', ip_address: '', asset_type: 'Server', criticality: 'Low', owner: 'Admin'
  });
  const [errors, setErrors] = useState<any>({});
  const role = localStorage.getItem('role');

  useEffect(() => { fetchAssets(); }, [searchTerm]);

  const fetchAssets = async () => {
    const res = await axios.get(`/api/assets?hostname=${searchTerm}`);
    setAssets(res.data || []);
  };


  const handleOpenCreate = () => {
    setEditingAsset(null);
    setFormData({ hostname: '', ip_address: '', asset_type: 'Server', criticality: 'Low', owner: 'Admin' });
    setErrors({});
    setShowForm(true);
  };

  const handleOpenEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({ ...asset });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    try {
      if (editingAsset) {
        await axios.put(`/api/assets/update?id=${editingAsset.id}`, formData);
      } else {
        await axios.post('/api/assets/create', formData);
      }
      setShowForm(false);
      fetchAssets();
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Permanently decommission this asset?')) return;
    await axios.delete(`/api/assets/delete?id=${id}`);
    fetchAssets();
  };

  return (
    <div className="container mt-4 support-content">
      <div className="grid">
        <div className="grid-header">
          <div className="d-flex align-items-center">
            <i className="bi bi-pc-display me-2" style={{fontSize: '1.5em'}}></i>
            <span className="h5 mb-0">Network Assets</span>
          </div>
          <div className="grid-tools">
            {role === 'admin' && (
              <button className="btn btn-custom btn-sm" onClick={handleOpenCreate}>
                REGISTER NEW ASSET
              </button>
            )}

          </div>
        </div>
        <div className="grid-body">
          <div className="d-flex mb-4">
            <input 
              type="text" 
              className="form-control form-control-custom me-2" 
              placeholder="Search hostname..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{width: '250px'}}
            />
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hostname</th>
                <th>IP Address</th>
                <th>Type</th>
                <th>Criticality</th>
                <th>Owner</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(assets) && assets.map(a => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.hostname}</td>
                  <td>{a.ip_address}</td>
                  <td>{a.asset_type}</td>
                  <td>{a.criticality}</td>
                  <td>{a.owner}</td>
                  <td>
                    {role === 'admin' && (
                      <>
                        <button className="btn btn-sm btn-outline-warning me-2" onClick={() => handleOpenEdit(a)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(a.id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingAsset ? `Edit Asset #${editingAsset.id}` : 'Register New Asset'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowForm(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small">Hostname</label>
                      <input 
                        className={`form-control ${errors.hostname ? 'is-invalid' : ''}`}
                        value={formData.hostname} 
                        onChange={e => setFormData({...formData, hostname: e.target.value})}
                      />
                      {errors.hostname && <div className="invalid-feedback">{errors.hostname}</div>}
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small">IP Address</label>
                      <input 
                        className={`form-control ${errors.ip_address ? 'is-invalid' : ''}`}
                        value={formData.ip_address} 
                        onChange={e => setFormData({...formData, ip_address: e.target.value})}
                      />
                      {errors.ip_address && <div className="invalid-feedback">{errors.ip_address}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label small">Type</label>
                      <select 
                        className={`form-select ${errors.asset_type ? 'is-invalid' : ''}`}
                        value={formData.asset_type}
                        onChange={e => setFormData({...formData, asset_type: e.target.value})}
                      >
                        <option value="Server">Server</option>
                        <option value="Workstation">Workstation</option>
                        <option value="Mobile">Mobile</option>
                        <option value="IoT">IoT</option>
                        <option value="Network">Network</option>
                      </select>
                      {errors.asset_type && <div className="invalid-feedback">{errors.asset_type}</div>}
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label small">Criticality</label>
                      <select 
                        className="form-select"
                        value={formData.criticality}
                        onChange={e => setFormData({...formData, criticality: e.target.value})}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label small">Owner</label>
                      <input 
                        className="form-control"
                        value={formData.owner} 
                        onChange={e => setFormData({...formData, owner: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-custom">
                    {editingAsset ? 'UPDATE RECORD' : 'SAVE RECORD'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetList;
