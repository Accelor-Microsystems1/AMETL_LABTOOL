import React, {useState} from 'react';
import Badge from '../customizedComponents/Badge';

const RecordsTable = ({ recordType, records }) => {  
  const [loading, setLoading] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;
  
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getResultBadge = (result) => {
    const config = {
      PASS: { variant: 'success', label: 'Pass' },
      FAIL: { variant: 'danger', label: 'Fail' },
      CONDITIONAL_PASS: { variant: 'warning', label: 'Conditional Pass' },
      OBSERVATION: { variant: 'info', label: 'Observation' },
      OPEN: { variant: 'danger', label: 'Open' },
      UNDER_INVESTIGATION: { variant: 'warning', label: 'Under Investigation' },
      RESOLVED: { variant: 'success', label: 'Resolved' },
      CLOSED: { variant: 'default', label: 'Closed' },
      PLANNED: { variant: 'info', label: 'Planned' },
      IN_PROGRESS: { variant: 'warning', label: 'In Progress' },
      COMPLETED: { variant: 'success', label: 'Completed' },
      OVERDUE: { variant: 'danger', label: 'Overdue' },
      CANCELLED: { variant: 'default', label: 'Cancelled' }
    };
    const { variant, label } = config[result] || { variant: 'default', label: result };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getCertificateUrl = (certificatePath) => {
    if (!certificatePath) return null;
    const normalizedPath = certificatePath.replace(/\\/g, '/');
    return `${API_BASE_URL}/${normalizedPath}`;
  };

const handleViewCertificate = async (record) => {
  if (!record.certificateFile) return;

  try {
    const certificateUrl = getCertificateUrl(record.certificateFile);
    const response = await fetch(certificateUrl);
    const blob = await response.blob();
    const pdfBlob = new Blob([blob], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    console.error('View failed:', error);
  }
};

const handleDownloadCertificate = async (record) => {
  if (!record.certificateFile) return;

  try {
    const certificateUrl = getCertificateUrl(record.certificateFile);

    const response = await fetch(certificateUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const date = new Date(record.dateOfCalibration).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    link.download = `Certificate_${record.certificateNo}_${date}.pdf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

  if (records.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No {recordType} records found
      </div>
    );
  }

 const renderTable = () => {
    switch (recordType) {
      case 'calibration':
        return (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase w-16">S.No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Date of Calibration</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Certificate No.</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {records.map((r, index) => (
                <tr key={r.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-4 text-sm text-gray-400 font-medium">{index + 1}.</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{formatDate(r.dateOfCalibration)}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{formatDate(r.dueDate)}</td>
                  <td className="px-6 py-4">{getResultBadge(r.calibrationResult)}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{r.certificateNo}</td>
                  <td className="px-6 py-4">
                    {r.certificateFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewCertificate(r)}
                          disabled={loading === r.id + '-view'}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-md transition-all duration-200 disabled:opacity-50"
                          title="View Certificate"
                        >
                          {loading === r.id + '-view' ? (
                            <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadCertificate(r)}
                          disabled={loading === r.id + '-download'}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-md transition-all duration-200 disabled:opacity-50"
                          title="Download Certificate"
                        >
                          {loading === r.id + '-download' ? (
                            <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                          )}
                          Download
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">No certificate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'performance':
        return (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase w-16">S.No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Check Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Next Check</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Report No.</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {records.map((r, index) => (
                <tr key={r.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-4 text-sm text-gray-400 font-medium">{index + 1}.</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{formatDate(r.dateOfPerformanceCheck)}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{formatDate(r.nextPerformanceCheck)}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{r.performanceCheckReportNo}</td>
                  <td className="px-6 py-4">{getResultBadge(r.result)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'maintenance':
        return (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase w-16">S.No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Planned Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Next Maintenance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {records.map((r, index) => (
                <tr key={r.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-4 text-sm text-gray-400 font-medium">{index + 1}.</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{formatDate(r.plannedDateOfMaintenance)}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{formatDate(r.conditionBasedNextMaintenance)}</td>
                  <td className="px-6 py-4">{getResultBadge(r.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{r.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'incident':
        return (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase w-16">S.No</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Problem</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {records.map((r, index) => (
                <tr key={r.id} className="hover:bg-gray-700/50">
                  <td className="px-4 py-4 text-sm text-gray-400 font-medium">{index + 1}.</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{formatDate(r.dateOfFailure)}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">{r.typesOfProblemsObserved}</td>
                  <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">{r.correctiveActionTaken}</td>
                  <td className="px-6 py-4">{getResultBadge(r.presentStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      {renderTable()}
    </div>
  );
};

export default RecordsTable;