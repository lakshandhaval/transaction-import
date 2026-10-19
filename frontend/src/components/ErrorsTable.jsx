export default function ErrorsTable({ errors = [] }) {
  if (!errors.length) return null;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Row</th><th>Transaction ID</th><th>Reasons</th></tr></thead>
        <tbody>{errors.map((item, index) => (
          <tr key={`${item.row}-${item.transaction_id}-${index}`}>
            <td>{item.row ?? '-'}</td><td>{item.transaction_id || '-'}</td>
            <td>{item.reason?.map((reason) => <div key={reason}>{reason}</div>)}</td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
