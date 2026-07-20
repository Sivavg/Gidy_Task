import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { 
  Search, 
  UploadCloud, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/logs';

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [limit, setLimit] = useState(20);
  
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const [severity, setSeverity] = useState('');
  const [role, setRole] = useState('');
  
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState('desc');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        sortOrder
      };
      
      if (severity) params.severity = severity;
      if (role) params.role = role;
      
      const response = await axios.get(API_URL, { params });
      
      setLogs(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
      setTotalRecords(response.data.pagination.total);
    } catch (err) {
      setError('Failed to fetch logs. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, severity, role, sortBy, sortOrder]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Handle Sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1); // Reset to page 1 on sort change
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={14} className="sort-icon" />;
    return sortOrder === 'asc' ? <ArrowUp size={14} className="sort-icon" /> : <ArrowDown size={14} className="sort-icon" />;
  };

  const getSeverityBadge = (level) => {
    const cls = `badge badge-${level.toLowerCase()}`;
    return <span className={cls}>{level}</span>;
  };

  const generateAndUploadMockLogs = async () => {
    try {
      setUploading(true);
      setError(null);
      
      // We will call the backend endpoint assuming there's a seed script 
      // or we just send 10k items from frontend directly. 
      // Since it's a requirement to upload 10k logs in a SINGLE request:
      const mockLogs = [];
      const actors = ['priya.nair@company.com', 'john.doe@company.com', 'admin.sys@company.com'];
      const roles = ['admin', 'user', 'moderator'];
      const actions = ['DELETE_USER', 'LOGIN', 'UPDATE_POLICY', 'EXPORT_DATA'];
      const resources = ['USER', 'DOCUMENT', 'SYSTEM'];
      const regions = ['ap-south-1', 'us-east-1', 'eu-central-1'];
      const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const statuses = ['Resolved', 'Unresolved', 'In Progress'];
      
      for (let i = 0; i < 10000; i++) {
        mockLogs.push({
          actor: actors[Math.floor(Math.random() * actors.length)],
          role: roles[Math.floor(Math.random() * roles.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          resource: `/api/${resources[Math.floor(Math.random() * resources.length)].toLowerCase()}s/${Math.floor(Math.random() * 1000)}`,
          resourceType: resources[Math.floor(Math.random() * resources.length)],
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          region: regions[Math.floor(Math.random() * regions.length)],
          severity: severities[Math.floor(Math.random() * severities.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          timestamp: new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString()
        });
      }

      await axios.post(`${API_URL}/bulk`, { logs: mockLogs }, {
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      setPage(1);
      fetchLogs();
    } catch (err) {
      setError('Failed to upload logs.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <header className="header">
        <h1>System Audit Logs</h1>
        <button 
          className="btn btn-primary" 
          onClick={generateAndUploadMockLogs}
          disabled={uploading}
        >
          {uploading ? (
            <div className="skeleton" style={{width: '20px', height: '20px', borderRadius: '50%'}}></div>
          ) : (
            <UploadCloud size={18} />
          )}
          {uploading ? 'Uploading 10k...' : 'Bulk Upload 10k Logs'}
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #fca5a5', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="dashboard-controls card">
        <div className="search-bar">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            className="input" 
            placeholder="Search by actor, action, resource, IP..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        
        <div className="input-group">
          <label><Filter size={14} style={{display: 'inline', marginRight: '4px'}}/> Severity</label>
          <select 
            className="select" 
            value={severity} 
            onChange={(e) => { setSeverity(e.target.value); setPage(1); }}
          >
            <option value="">All</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>

        <div className="input-group">
          <label>Role</label>
          <select 
            className="select" 
            value={role} 
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
          >
            <option value="">All</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="moderator">Moderator</option>
          </select>
        </div>
        
        <div className="input-group">
          <label>Per Page</label>
          <select 
            className="select" 
            value={limit} 
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="table-container animate-fade-in">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('timestamp')}>Timestamp {getSortIcon('timestamp')}</th>
              <th onClick={() => handleSort('actor')}>Actor {getSortIcon('actor')}</th>
              <th onClick={() => handleSort('action')}>Action {getSortIcon('action')}</th>
              <th onClick={() => handleSort('resource')}>Resource {getSortIcon('resource')}</th>
              <th onClick={() => handleSort('severity')}>Severity {getSortIcon('severity')}</th>
              <th onClick={() => handleSort('status')}>Status {getSortIcon('status')}</th>
              <th onClick={() => handleSort('ipAddress')}>IP Address {getSortIcon('ipAddress')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: limit }).map((_, idx) => (
                <tr key={idx}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <td key={i}>
                      <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                  No logs found matching the criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </td>
                  <td>
                    <div>{log.actor}</div>
                    <div className="text-muted">Role: {log.role}</div>
                  </td>
                  <td><span className="action-text">{log.action}</span></td>
                  <td>{log.resource}</td>
                  <td>{getSeverityBadge(log.severity)}</td>
                  <td>{log.status}</td>
                  <td>
                    <div>{log.ipAddress}</div>
                    <div className="text-muted">{log.region}</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="pagination-info">
          Showing {logs.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalRecords)} of {totalRecords} entries
        </div>
        <div className="pagination-controls">
          <button 
            className="btn" 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          
          <button 
            className="btn" 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0 || loading}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
