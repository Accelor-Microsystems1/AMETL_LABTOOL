import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../customizedComponents/Badge';
import Loader from '../customizedComponents/Loader';

const EquipmentTable = ({ equipments, isLoading }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const config = {
      ACTIVE: { variant: 'success', label: 'Active' },
      INACTIVE: { variant: 'default', label: 'Inactive' },
      UNDER_MAINTENANCE: { variant: 'warning', label: 'Under Maintenance' },
      UNDER_CALIBRATION: { variant: 'info', label: 'Under Calibration' },
      OUT_OF_ORDER: { variant: 'danger', label: 'Out of Order' },
      RETIRED: { variant: 'default', label: 'Retired' }
    };
    const { variant, label } = config[status] || config.INACTIVE;
    return <Badge variant={variant}>{label}</Badge>;
  };

  const handleRowClick = (id) => {
    navigate(`/equipment/${id}`);
  };

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-12">
        <Loader text="Loading equipments..." />
      </div>
    );
  }

  // Empty state
  if (equipments.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-300">No equipment found</h3>
        <p className="mt-2 text-sm text-gray-500">Get started by adding your first equipment.</p>
      </div>
    );
  }

  // Table
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Equipment ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Equipment Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Manufacturer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Model</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Serial No.</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {equipments.map((equipment, index) => (
              <tr 
                key={equipment.id}
                onClick={() => handleRowClick(equipment.id)}
                className={`cursor-pointer transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-800/30'} hover:bg-gray-700/50`}
              >
                <td className="px-6 py-4 text-sm font-medium text-teal-400">{equipment.equipmentId}</td>
                <td className="px-6 py-4 text-sm text-gray-200">{equipment.equipmentName}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{equipment.manufacturerName}</td>
                <td className="px-6 py-4 text-sm text-gray-300">{equipment.manufacturerModel}</td>
                <td className="px-6 py-4 text-sm text-gray-400">{equipment.equipmentSerialNumber}</td>
                <td className="px-6 py-4">{getStatusBadge(equipment.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EquipmentTable;