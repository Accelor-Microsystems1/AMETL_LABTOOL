import React from 'react';
import Badge from '../customizedComponents/Badge';

const RecordsTable = ({ recordType, records }) => {
  
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Due Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Certificate No.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-700/50">
                  <td className="px-6 py-4 text-sm text-gray-200">{formatDate(r.dateOfCalibration)}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{formatDate(r.dueDate)}</td>
                  <td className="px-6 py-4">{getResultBadge(r.calibrationResult)}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{r.certificateNo}</td>
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Check Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Next Check</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Report No.</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-700/50">
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Planned Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Next Maintenance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Remark</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-700/50">
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
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Problem</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-700/50">
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