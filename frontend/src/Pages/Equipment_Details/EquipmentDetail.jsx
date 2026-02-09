import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { equipmentAPI, calibrationAPI, performanceAPI, maintenanceAPI, incidentAPI } from './Api';
import Button from '../../components/customizedComponents/Button';
import Badge from '../../components/customizedComponents/Badge';
import Select from '../../components/customizedComponents/Select';
import Loader from '../../components/customizedComponents/Loader';
import RecordTypeCard from '../../components/Equipment/RecordTypeCard';
import RecordsTable from '../../components/Equipment/RecordTable';
import CalibrationModal from '../../components/Models/CalibrationModel';
import PerformanceModal from '../../components/Models/PerformanceModel';
import MaintenanceModal from '../../components/Models/MaintenanceModel';
import IncidentModal from '../../components/Models/IncidentModel';
import {toast} from 'sonner';

const EquipmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecordType, setSelectedRecordType] = useState('calibration');
  
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const response = await equipmentAPI.getById(id);
      setEquipment(response.data);
    } catch (error) {
      toast.error(error.message);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const config = {
      ACTIVE: { variant: 'success', label: 'Active' },
      INACTIVE: { variant: 'default', label: 'Inactive' },
      UNDER_MAINTENANCE: { variant: 'warning', label: 'Under Maintenance' },
      UNDER_CALIBRATION: { variant: 'info', label: 'Under Calibration' },
    };
    
    const { variant, label } = config[status] || config.INACTIVE;
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Handle record submissions
  const handleAddCalibration = async (data) => {
    try {
      await calibrationAPI.create(data);
      toast.success('Calibration record added successfully');
      fetchEquipment();
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const handleAddPerformance = async (data) => {
    try {
      await performanceAPI.create(data);
      toast.success('Performance record added successfully');
      fetchEquipment();
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const handleAddMaintenance = async (data) => {
    try {
      await maintenanceAPI.create(data);
      toast.success('Maintenance record added successfully');
      fetchEquipment();
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const handleAddIncident = async (data) => {
    try {
      await incidentAPI.create(data);
      toast.success('Incident record added successfully');
      fetchEquipment();
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const recordTypeOptions = [
    { value: 'calibration', label: 'Calibration Records' },
    { value: 'performance', label: 'Performance Records' },
    { value: 'maintenance', label: 'Maintenance Records' },
    { value: 'incident', label: 'Incident Records' }
  ];

  const getCurrentRecords = () => {
    if (!equipment) return [];
    switch (selectedRecordType) {
      case 'calibration': return equipment.calibrationRecords || [];
      case 'performance': return equipment.performanceRecords || [];
      case 'maintenance': return equipment.maintenanceRecords || [];
      case 'incident': return equipment.incidentRecords || [];
      default: return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader size="lg" text="Loading equipment details..." />
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-200">Equipment not found</h2>
          <Button className="mt-4" onClick={() => navigate('/equipment')}>
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => navigate('/equipment')}
            className="flex items-center text-gray-400 hover:text-gray-200 mb-4 transition-colors"
          >
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Equipment List
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-100">{equipment.equipmentName}</h1>
                {getStatusBadge(equipment.status)}
              </div>
              <p className="mt-1 text-sm text-gray-400">
                {equipment.equipmentId} • {equipment.manufacturerName} {equipment.manufacturerModel}
              </p>
            </div>
            <Button variant="secondary">
              Edit Equipment
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Basic Information Card */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-100 mb-6">Equipment Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-400">Equipment ID</p>
              <p className="text-gray-100 font-medium">{equipment.equipmentId}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Equipment Name</p>
              <p className="text-gray-100 font-medium">{equipment.equipmentName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Manufacturer</p>
              <p className="text-gray-100 font-medium">{equipment.manufacturerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Model</p>
              <p className="text-gray-100 font-medium">{equipment.manufacturerModel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Serial Number</p>
              <p className="text-gray-100 font-medium">{equipment.equipmentSerialNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Range</p>
              <p className="text-gray-100 font-medium">{equipment.range || 'N/A'}</p>
            </div>
          </div>

          {/* Qualification Dates */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-md font-medium text-gray-200 mb-4">Qualification Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Installation Qualification (IQ)</p>
                <p className="text-gray-100 font-medium">{formatDate(equipment.installationQualification)}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Operational Qualification (OQ)</p>
                <p className="text-gray-100 font-medium">{formatDate(equipment.operationalQualification)}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4">
                <p className="text-sm text-gray-400">Performance Qualification (PQ)</p>
                <p className="text-gray-100 font-medium">{formatDate(equipment.performanceQualification)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Record Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-100 mb-4">Add New Record</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RecordTypeCard
              title="Calibration"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              description="Add calibration certificate and results"
              recordCount={equipment.calibrationRecords?.length || 0}
              onAddClick={() => setIsCalibrationModalOpen(true)}
            />
            <RecordTypeCard
              title="Performance"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              description="Add performance check results"
              recordCount={equipment.performanceRecords?.length || 0}
              onAddClick={() => setIsPerformanceModalOpen(true)}
            />
            <RecordTypeCard
              title="Maintenance"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              description="Add maintenance records"
              recordCount={equipment.maintenanceRecords?.length || 0}
              onAddClick={() => setIsMaintenanceModalOpen(true)}
            />
            <RecordTypeCard
              title="Incident"
              icon={
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
              description="Report failures and incidents"
              recordCount={equipment.incidentRecords?.length || 0}
              onAddClick={() => setIsIncidentModalOpen(true)}
            />
          </div>
        </div>

        {/* Existing Records Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">Existing Records</h2>
            <div className="w-48">
              <Select
                value={selectedRecordType}
                onChange={(e) => setSelectedRecordType(e.target.value)}
                options={recordTypeOptions}
              />
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <RecordsTable 
              recordType={selectedRecordType} 
              records={getCurrentRecords()} 
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <CalibrationModal
        isOpen={isCalibrationModalOpen}
        onClose={() => setIsCalibrationModalOpen(false)}
        onSubmit={handleAddCalibration}
        equipmentName={equipment.equipmentName}
        equipmentId={equipment.id}
      />
      <PerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
        onSubmit={handleAddPerformance}
        equipmentName={equipment.equipmentName}
        equipmentId={equipment.id}
      />
      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSubmit={handleAddMaintenance}
        equipmentName={equipment.equipmentName}
        equipmentId={equipment.id}
      />
      <IncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSubmit={handleAddIncident}
        equipmentName={equipment.equipmentName}
        equipmentId={equipment.id}
      />
    </div>
  );
};

export default EquipmentDetailPage;