import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useUser } from '../context/UserContext';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

const formatDate = (value) => new Date(value).toLocaleString();

export default function BatchesPage() {
  const { userName } = useUser();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadBatches = useCallback(async () => {
    setLoading(true); setError('');
    try { setBatches(await api('/batches', { user: userName })); }
    catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [userName]);
  useEffect(() => { loadBatches(); }, [loadBatches]);

  return <section>
    <div className="page-heading"><h1>Batches</h1><button onClick={loadBatches} disabled={loading}>Refresh</button></div>
    <ErrorMessage>{error}</ErrorMessage>
    {loading ? <Loading /> : batches.length === 0 ? <p>No batches yet.</p> : <div className="table-wrap"><table>
      <thead><tr><th>ID</th><th>File name</th><th>Status</th><th>Total</th><th>Valid</th><th>Invalid</th><th>Pending</th><th>Authorized</th><th>Created at</th><th /></tr></thead>
      <tbody>{batches.map((batch) => <tr key={batch.id}>
        <td>{batch.id}</td><td>{batch.file_name}</td><td><StatusBadge status={batch.status} /></td><td>{batch.total_rows}</td><td>{batch.valid_count}</td><td>{batch.invalid_count}</td><td>{batch.pending_count}</td><td>{batch.authorized_count}</td><td>{formatDate(batch.created_at)}</td><td><Link to={`/batches/${batch.id}`}>View</Link></td>
      </tr>)}</tbody>
    </table></div>}
  </section>;
}
