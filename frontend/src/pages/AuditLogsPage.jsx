import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useUser } from '../context/UserContext';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

function detailsText(details) {
  try { return Object.entries(JSON.parse(details)).map(([key, value]) => `${key}: ${value}`).join(', '); }
  catch { return details; }
}

export default function AuditLogsPage() {
  const { userName } = useUser();
  const [logs, setLogs] = useState([]);
  const [action, setAction] = useState('');
  const [batchId, setBatchId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadLogs = useCallback(async () => {
    setLoading(true); setError('');
    const params = new URLSearchParams(); if (action) params.set('action', action); if (batchId) params.set('batchId', batchId);
    try { setLogs(await api(`/audit-logs${params.toString() ? `?${params}` : ''}`, { user: userName })); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [action, batchId, userName]);
  useEffect(() => { loadLogs(); }, [loadLogs]);
  return <section>
    <h1>Audit logs</h1>
    <div className="filters"><label>Action <select value={action} onChange={(event) => setAction(event.target.value)}><option value="">All</option><option value="UPLOAD">UPLOAD</option><option value="APPROVE">APPROVE</option></select></label><label>Batch ID <input value={batchId} onChange={(event) => setBatchId(event.target.value)} inputMode="numeric" /></label><button onClick={loadLogs} disabled={loading}>Refresh</button></div>
    <ErrorMessage>{error}</ErrorMessage>
    {loading ? <Loading /> : logs.length === 0 ? <p>No audit logs found.</p> : <div className="table-wrap"><table><thead><tr><th>ID</th><th>Action</th><th>Batch ID</th><th>Performed by</th><th>Details</th><th>Created at</th></tr></thead><tbody>
      {logs.map((log) => <tr key={log.id}><td>{log.id}</td><td><span className={`badge ${log.action === 'APPROVE' ? 'success' : 'info'}`}>{log.action}</span></td><td><Link to={`/batches/${log.batch_id}`}>{log.batch_id}</Link></td><td>{log.performed_by}</td><td>{detailsText(log.details)}</td><td>{new Date(log.created_at).toLocaleString()}</td></tr>)}
    </tbody></table></div>}
  </section>;
}
