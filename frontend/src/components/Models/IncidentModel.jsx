import React, { useState } from 'react';
import Modal from './Model';
import DatePicker from '../customizedComponents/DatePicker';
import Select from '../customizedComponents/Select';
import TextArea from '../customizedComponents/TextArea';
import Button from '../customizedComponents/Button';

const IncidentModal = ({ isOpen, onClose, onSubmit, equipmentName, equipmentId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateOfFailure: '',
    typesOfProblemsObserved: '',
    causesOfFailures: '',
    correctiveActionTaken: '',
    presentStatus: '',
    statusDate: ''
  });
  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: 'OPEN', label: 'Open' },
    { value: 'UNDER_INVESTIGATION', label: 'Under Investigation' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.dateOfFailure) newErrors.dateOfFailure = 'Date is required';
    if (!formData.typesOfProblemsObserved.trim()) newErrors.typesOfProblemsObserved = 'Problem is required';
    if (!formData.causesOfFailures.trim()) newErrors.causesOfFailures = 'Cause is required';
    if (!formData.correctiveActionTaken.trim()) newErrors.correctiveActionTaken = 'Action is required';
    if (!formData.presentStatus) newErrors.presentStatus = 'Status is required';
    if (!formData.statusDate) newErrors.statusDate = 'Status Date is required';
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
    setFormData({ dateOfFailure: '', typesOfProblemsObserved: '', causesOfFailures: '', correctiveActionTaken: '', presentStatus: '', statusDate: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Incident Record" subtitle={`Equipment: ${equipmentName}`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <DatePicker label="Date of Failure" name="dateOfFailure" value={formData.dateOfFailure} onChange={handleInputChange} error={errors.dateOfFailure} required />
        <TextArea label="Types of Problems Observed" name="typesOfProblemsObserved" value={formData.typesOfProblemsObserved} onChange={handleInputChange} error={errors.typesOfProblemsObserved} required />
        <TextArea label="Causes of Failures" name="causesOfFailures" value={formData.causesOfFailures} onChange={handleInputChange} error={errors.causesOfFailures} required />
        <TextArea label="Corrective Action Taken" name="correctiveActionTaken" value={formData.correctiveActionTaken} onChange={handleInputChange} error={errors.correctiveActionTaken} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Present Status" name="presentStatus" value={formData.presentStatus} onChange={handleInputChange} options={statusOptions} error={errors.presentStatus} required />
          <DatePicker label="Status Date" name="statusDate" value={formData.statusDate} onChange={handleInputChange} error={errors.statusDate} required />
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Save Record</Button>
        </div>
      </form>
    </Modal>
  );
};

export default IncidentModal;