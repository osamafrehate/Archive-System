function getStatusColor(expireDateString) {
  const now = new Date();
  const expireDate = new Date(expireDateString);
  const msPerDay = 1000 * 60 * 60 * 24;
  const difference = expireDate - now;
  const days = Math.ceil(difference / msPerDay);

  if (days <= 14) {
    return { colorClass: 'status-red', text: days < 0 ? 'Expired' : 'Expiring soon' };
  }

  if (days < 180) {
    return { colorClass: 'status-yellow', text: `${days} days` };
  }

  return { colorClass: 'status-blue', text: `${days} days` };
}

export default function StatusFileRow({ file, showAmount = false }) {
  const status = getStatusColor(file.expireDate);

  return (
    <tr key={file.id}>
      <td>{file.user}</td>
      <td>{file.originalFilename}</td>
      <td>{file.fileNumber}</td>
      <td>{file.inputDate}</td>
      <td>{file.expireDate}</td>
      <td>{file.uploadedAt}</td>
      <td>{file.documentType}</td>
      <td>
        {showAmount ? (
          file.amount !== undefined ? `$${file.amount.toFixed(2)}` : '-'
        ) : (
          <span className={`status-chip ${status.colorClass}`}>{status.text}</span>
        )}
      </td>
    </tr>
  );
}
