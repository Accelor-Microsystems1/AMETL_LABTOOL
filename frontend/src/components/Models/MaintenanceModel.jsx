import React, { useState } from 'react';
import Modal from './Model';
import DatePicker from '../customizedComponents/DatePicker';
import Select from '../customizedComponents/Select';
import TextArea from '../customizedComponents/TextArea';
import Button from '../customizedComponents/Button';

const MaintenanceModal = ({ isOpen, onClose, onSubmit, equipmentName, equipmentId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    plannedDateOfMaintenance: '',
    conditionBasedNextMaintenance: '',
    status: '',
    remark: ''
  });
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: 'PLANNED', label: 'Planned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'OVERDUE', label: 'Overdue' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.plannedDateOfMaintenance) newErrors.plannedDateOfMaintenance = 'Planned Date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSubmit({ ...formData, equipmentId });
      handleClose();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ plannedDateOfMaintenance: '', conditionBasedNextMaintenance: '', status: '', remark: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Maintenance Record" subtitle={`Equipment: ${equipmentName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <DatePicker label="Planned Date of Maintenance" name="plannedDateOfMaintenance" value={formData.plannedDateOfMaintenance} onChange={handleInputChange} error={errors.plannedDateOfMaintenance} required />
        <DatePicker label="Condition Based Next Maintenance" name="conditionBasedNextMaintenance" value={formData.conditionBasedNextMaintenance} onChange={handleInputChange} />
        <Select label="Status" name="status" value={formData.status} onChange={handleInputChange} options={statusOptions} error={errors.status} required />
        <TextArea label="Remark" name="remark" value={formData.remark} onChange={handleInputChange} placeholder="Enter any remarks..." />
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Save Record</Button>
        </div>
      </form>
    </Modal>
  );
};

export default MaintenanceModal;