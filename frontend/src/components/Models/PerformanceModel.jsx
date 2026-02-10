import React, { useState } from 'react';
import Modal from './Model';
import Input from '../customizedComponents/Input';
import DatePicker from '../customizedComponents/DatePicker';
import Select from '../customizedComponents/Select';
import Button from '../customizedComponents/Button';

const PerformanceModal = ({ isOpen, onClose, onSubmit, equipmentName, equipmentId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateOfPerformanceCheck: '',
    nextPerformanceCheck: '',
    performanceCheckReportNo: '',
    result: ''
  });
  const [errors, setErrors] = useState({});

  const resultOptions = [
    { value: 'PASS', label: 'Pass' },
    { value: 'FAIL', label: 'Fail' },
    { value: 'OBSERVATION', label: 'Observation' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.dateOfPerformanceCheck) newErrors.dateOfPerformanceCheck = 'Date is required';
    if (!formData.nextPerformanceCheck) newErrors.nextPerformanceCheck = 'Next check date is required';
    if (!formData.performanceCheckReportNo.trim()) newErrors.performanceCheckReportNo = 'Report No. is required';
    if (!formData.result) newErrors.result = 'Result is required';
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
    setFormData({
      dateOfPerformanceCheck: '',
      nextPerformanceCheck: '',
      performanceCheckReportNo: '',
      result: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Performance Record" subtitle={`Equipment: ${equipmentName}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker label="Date of Performance Check" name="dateOfPerformanceCheck" value={formData.dateOfPerformanceCheck} onChange={handleInputChange} error={errors.dateOfPerformanceCheck} required />
          <DatePicker label="Next Performance Check" name="nextPerformanceCheck" value={formData.nextPerformanceCheck} onChange={handleInputChange} error={errors.nextPerformanceCheck} required />
        </div>
        <Input label="Report No." name="performanceCheckReportNo" value={formData.performanceCheckReportNo} onChange={handleInputChange} placeholder="e.g., PERF-2024-001" error={errors.performanceCheckReportNo} required />
        <Select label="Result" name="result" value={formData.result} onChange={handleInputChange} options={resultOptions} error={errors.result} required />
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" isLoading={isLoading}>Save Record</Button>
        </div>
      </form>
    </Modal>
  );
};

export default PerformanceModal;