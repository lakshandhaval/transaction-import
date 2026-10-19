export default function StatusBadge({ status }) {
  const type = status === 'APPROVED' || status === 'AUTHORIZED' ? 'success' : 'warning';
  return <span className={`badge ${type}`}>{status}</span>;
}
