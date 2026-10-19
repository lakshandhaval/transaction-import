import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useUser } from '../context/UserContext';
import ErrorMessage from '../components/ErrorMessage';
import ErrorsTable from '../components/ErrorsTable';

export default function UploadPage() {
  const { userName } = useUser();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [uploading, setUploading] = useState(false);

  async function upload(event) {
    event.preventDefault();
    setError(''); setWarning(''); setResult(null);
    if (!file) return setError('Please select a CSV file.');
    if (!file.name.toLowerCase().endsWith('.csv')) return setError('Only .csv files are allowed.');
    if (file.size > 2 * 1024 * 1024) return setError('File too large (max 2MB).');
    setUploading(true);
    const formData = new FormData(); formData.append('file', file);
    try {
      setResult(await api('/upload', { method: 'POST', body: formData, user: userName }));
    } catch (requestError) {
      if (requestError.status === 400 && requestError.data?.batchId === null) {
        setWarning(requestError.data.message);
        setResult(requestError.data);
      } else setError(requestError.message);
    } finally { setUploading(false); }
  }

  return <section>
    <h1>Upload transactions</h1>
    <p>Upload a CSV file to create a transaction batch. <a href="/transactions.csv">Download sample CSV</a></p>
    <form className="card form-row" onSubmit={upload}>
      <input type="file" accept=".csv,text/csv" onChange={(event) => setFile(event.target.files[0] || null)} />
      <button disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
    </form>
    <ErrorMessage>{error}</ErrorMessage>
    {warning && <div className="message warning">{warning}</div>}
    {result && <>
      <div className="card summary"><div><strong>Total rows</strong>{result.totalRows}</div><div><strong>Valid</strong>{result.validCount}</div><div><strong>Invalid</strong>{result.invalidCount}</div></div>
      {result.batchId !== null && <p><Link to={`/batches/${result.batchId}`}>View batch #{result.batchId}</Link></p>}
      <ErrorsTable errors={result.errors} />
    </>}
  </section>;
}
