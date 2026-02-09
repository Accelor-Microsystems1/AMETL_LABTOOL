import React, { useState, useEffect, useMemo } from 'react';
import { equipmentAPI } from './Api';
import Button from '../../components/customizedComponents/Button';
import SearchBar from '../../components/customizedComponents/SearchBar';
import Select from '../../components/customizedComponents/Select';
import EquipmentTable from '../../components/Equipment/EquipmentTable';
import CreateEquipmentModal from '../../components/Models/CreateEquipmentModel';
import {toast} from 'sonner';

const EquipmentListPage = () => {
  const [equipments, setEquipments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
    { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
    { value: 'UNDER_CALIBRATION', label: 'Under Calibration' },
    { value: 'OUT_OF_ORDER', label: 'Out of Order' },
    { value: 'RETIRED', label: 'Retired' }
  ];

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      setIsLoading(true);
      const response = await equipmentAPI.getAll();
      setEquipments(response.data?.equipments || []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEquipments = useMemo(() => {
    return equipments.filter((equipment) => {
      const matchesSearch = 
        searchQuery === '' ||
        equipment.equipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipment.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipment.manufacturerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        equipment.equipmentSerialNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === '' || 
        equipment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [equipments, searchQuery, statusFilter]);

  const handleCreateEquipment = async (data) => {
    try {
      await equipmentAPI.create(data);
      toast.success('Equipment created successfully');
      fetchEquipments();
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Equipment Management</h1>
              <p className="mt-1 text-sm text-gray-400">
                Manage all laboratory equipment and their records
              </p>
            </div>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Create New Equipment
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by ID, Name, Manufacturer, Serial No..."
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={statusOptions}
                placeholder="All Status"
              />
            </div>
            {(searchQuery || statusFilter) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>

          <div className="text-sm text-gray-400">
            Showing {filteredEquipments.length} of {equipments.length} equipment
          </div>
        </div>

        {/* Equipment Table */}
        <EquipmentTable 
          equipments={filteredEquipments} 
          isLoading={isLoading} 
        />
      </main>

      {/* Create Equipment Modal */}
      <CreateEquipmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEquipment}
      />
    </div>
  );
};

export default EquipmentListPage;