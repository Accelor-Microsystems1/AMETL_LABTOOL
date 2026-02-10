import React, { useState } from 'react';
import Modal from './Model';
import Input from '../customizedComponents/Input';
import DatePicker from '../customizedComponents/DatePicker';
import Select from '../customizedComponents/Select';
import FileUpload from '../customizedComponents/FileUpload';
import Button from '../customizedComponents/Button';

const CalibrationModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  equipmentName,  
  equipmentId     
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateOfCalibration: '',
    dueDate: '',
    calibrationResult: '',
    certificateNo: ''
  });
  const [certificateFile, setCertificateFile] = useState(null);
  const [errors, setErrors] = useState({});

  const resultOptions = [
    { value: 'PASS', label: 'Pass' },
    { value: 'FAIL', label: 'Fail' },
    { value: 'CONDITIONAL_PASS', label: 'Conditional Pass' }
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
    
    if (!formData.dateOfCalibration) 
      newErrors.dateOfCalibration = 'Date of Calibration is required';
    if (!formData.dueDate) 
      newErrors.dueDate = 'Due Date is required';
    if (!formData.calibrationResult) 
      newErrors.calibrationResult = 'Calibration Result is required';
    if (!formData.certificateNo.trim()) 
      newErrors.certificateNo = 'Certificate No. is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onSubmit({
        ...formData,
        equipmentId,     
        certificateFile
      });
      handleClose();
    } catch (error) {
      console.error('Error adding calibration record:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      dateOfCalibration: '',
      dueDate: '',
      calibrationResult: '',
      certificateNo: ''
    });
    setCertificateFile(null);
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Calibration Record"
      subtitle={`Equipment: ${equipmentName}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DatePicker
            label="Date of Calibration"
            name="dateOfCalibration"
            value={formData.dateOfCalibration}
            onChange={handleInputChange}
            error={errors.dateOfCalibration}
            required
          />
          
          <DatePicker
            label="Due Date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            error={errors.dueDate}
            required
          />
        </div>

        <Select
          label="Calibration Result"
          name="calibrationResult"
          value={formData.calibrationResult}
          onChange={handleInputChange}
          options={resultOptions}
          error={errors.calibrationResult}
          required
        />

        <Input
          label="Certificate No."
          name="certificateNo"
          value={formData.certificateNo}
          onChange={handleInputChange}
          placeholder="e.g., CAL-2024-001"
          error={errors.certificateNo}
          required
        />

        <FileUpload
          label="Certificate File"
          value={certificateFile}
          onChange={setCertificateFile}
        />

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Save Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CalibrationModal;