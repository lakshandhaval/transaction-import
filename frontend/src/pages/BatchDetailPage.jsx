import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useUser } from '../context/UserContext';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';

export default function BatchDetailPage() {
  const { id } = useParams();
  const { role, userName } = useUser();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [notFound, setNotFound] = useState(false);
  const loadBatch = useCallback(async () => {
    setLoading(true); setError(''); setNotFound(false);
    try { setBatch(await api(`/batches/${id}`, { user: userName })); }
    catch (requestError) { if (requestError.status === 404) setNotFound(true); else setError(requestError.message); }
    finally { setLoading(false); }
  }, [id, userName]);
  useEffect(() => { loadBatch(); }, [loadBatch]);
  const pendingCount = batch?.transactions.filter((transaction) => transaction.status === 'PENDING').length || 0;
  const canApprove = role === 'Checker' && batch?.status !== 'APPROVED' && pendingCount > 0 && !approving;
  async function approve() {
    if (!window.confirm(`Approve batch #${id}?`)) return;
    setApproving(true); setError(''); setSuccess('');
    try {
      const result = await api(`/batches/${id}/approve`, { method: 'POST', user: userName });
      setSuccess(`${result.message}. ${result.authorizedCount} transactions authorized.`);
      await loadBatch();
    } catch (requestError) { setError(requestError.message); }
    finally { setApproving(false); }
  }
  if (loading) return <Loading />;
  if (notFound) return <section><h1>Batch not found</h1><p>This batch may have been removed or the link is incorrect.</p><Link to="/batches">Back to Batches</Link></section>;
  if (!batch) return <ErrorMessage>{error}</ErrorMessage>;
  return <section>
    <div className="page-heading"><h1>Batch #{batch.id}</h1><StatusBadge status={batch.status} /></div>
    <div className="card summary"><div><strong>File name</strong>{batch.file_name}</div><div><strong>Total rows</strong>{batch.total_rows}</div><div><strong>Valid</strong>{batch.valid_count}</div><div><strong>Invalid</strong>{batch.invalid_count}</div></div>
    <div className="actions"><button onClick={approve} disabled={!canApprove}>{approving ? 'Approving...' : 'Approve batch'}</button>{role === 'Maker' && <span className="hint">Switch to Checker role to approve.</span>}</div>
    <ErrorMessage>{error}</ErrorMessage>{success && <div className="message success">{success}</div>}
    <h2>Transactions</h2>
    <div className="table-wrap"><table><thead><tr><th>Transaction ID</th><th>Customer</th><th>Account</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody>{batch.transactions.map((transaction) => <tr key={transaction.id}><td>{transaction.transaction_id}</td><td>{transaction.customer_name}</td><td>{transaction.account_number}</td><td>{Number(transaction.amount).toFixed(2)}</td><td><StatusBadge status={transaction.status} /></td></tr>)}</tbody>
    </table></div>
  </section>;
}
