import { useState } from 'react';
import Header from './Header';
import StatusFileRow from './StatusFileRow';
import './StatusFilePage.css';

const initialFiles = [
  {
    id: 1,
    user: 'Ahmed1',
    originalFilename: 'License_001.pdf',
    fileNumber: 'LIC-2026-001',
    inputDate: '2026-03-15',
    expireDate: '2027-10-15',
    uploadedAt: '2026-03-15 09:20',
    documentType: 'Official Licenses'
  },
  {
    id: 2,
    user: 'Mohammad',
    originalFilename: 'Insurance_Policy_002.pdf',
    fileNumber: 'INS-2026-002',
    inputDate: '2026-03-20',
    expireDate: '2026-08-10',
    uploadedAt: '2026-03-20 11:05',
    documentType: 'General Insurance Policies'
  },
  {
    id: 3,
    user: 'Hassan',
    originalFilename: 'Car_Insurance_003.pdf',
    fileNumber: 'CAR-2026-003',
    inputDate: '2026-03-25',
    expireDate: '2026-04-05',
    uploadedAt: '2026-03-25 14:13',
    documentType: 'Car Insurance Policies'
  },
  {
    id: 4,
    user: 'Salem ',
    originalFilename: 'Contract_004.pdf',
    fileNumber: 'CON-2026-004',
    inputDate: '2026-03-10',
    expireDate: '2026-09-01',
    uploadedAt: '2026-03-10 08:45',
    documentType: 'Contracts'
  }
];

export default function StatusFilePage() {
  const [files] = useState(initialFiles);

  return (
    <div className="status-file-page">
      <Header />
      <main className="status-file-content">
        <div className="table-wrapper">
          <table className="status-file-table">
            <thead>
              <tr>
                <th>User</th>
                <th>File Name</th>
                <th>File Number</th>
                <th>Input Date</th>
                <th>Expire Date</th>
                <th>Uploaded At</th>
                <th>Document Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <StatusFileRow key={file.id} file={file} />
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
