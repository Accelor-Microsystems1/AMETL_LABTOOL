import React, { useState } from 'react';
import Modal from './Model';
import Input from '../customizedComponents/Input';
import DatePicker from '../customizedComponents/DatePicker';
import FileUpload from '../customizedComponents/FileUpload';
import Button from '../customizedComponents/Button';

const CreateEquipmentModal = ({ isOpen, onClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: '',
    equipmentName: '',
    manufacturerName: '',
    manufacturerModel: '',
    equipmentSerialNumber: '',
    range: '',
    installationQualification: '',
    operationalQualification: '',
    performanceQualification: ''
  });
  
  const [files, setFiles] = useState({
    iq: null,
    oq: null,
    pq: null
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.equipmentId.trim()) 
      newErrors.equipmentId = 'Equipment ID is required';
    if (!formData.equipmentName.trim()) 
      newErrors.equipmentName = 'Equipment Name is required';
    if (!formData.manufacturerName.trim()) 
      newErrors.manufacturerName = 'Manufacturer Name is required';
    if (!formData.manufacturerModel.trim()) 
      newErrors.manufacturerModel = 'Manufacturer Model is required';
    if (!formData.equipmentSerialNumber.trim()) 
      newErrors.equipmentSerialNumber = 'Serial Number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;  
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const submitData = {
        ...formData,
      };
      
      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error('Error creating equipment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      equipmentId: '',
      equipmentName: '',
      manufacturerName: '',
      manufacturerModel: '',
      equipmentSerialNumber: '',
      range: '',
      installationQualification: '',
      operationalQualification: '',
      performanceQualification: ''
    });
    setFiles({ iq: null, oq: null, pq: null });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Equipment"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Equipment ID"
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleInputChange}
              placeholder="e.g., EQP-001"
              error={errors.equipmentId}
              required
            />
            
            <Input
              label="Equipment Name"
              name="equipmentName"
              value={formData.equipmentName}
              onChange={handleInputChange}
              placeholder="e.g., HPLC System"
              error={errors.equipmentName}
              required
            />
            
            <Input
              label="Manufacturer Name"
              name="manufacturerName"
              value={formData.manufacturerName}
              onChange={handleInputChange}
              placeholder="e.g., Agilent"
              error={errors.manufacturerName}
              required
            />
            
            <Input
              label="Manufacturer Model"
              name="manufacturerModel"
              value={formData.manufacturerModel}
              onChange={handleInputChange}
              placeholder="e.g., 1260 Infinity"
              error={errors.manufacturerModel}
              required
            />
            
            <Input
              label="Serial Number"
              name="equipmentSerialNumber"
              value={formData.equipmentSerialNumber}
              onChange={handleInputChange}
              placeholder="e.g., AG-2024-001"
              error={errors.equipmentSerialNumber}
              required
            />
            
            <Input
              label="Range"
              name="range"
              value={formData.range}
              onChange={handleInputChange}
              placeholder="e.g., 0-100°C"
            />
          </div>
        </div>

        <div className="border-t border-gray-700" />
        <div>
          <h3 className="text-lg font-medium text-gray-200 mb-4">Qualification Documents</h3>

          <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Installation Qualification (IQ)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="IQ Date"
                name="installationQualification"
                value={formData.installationQualification}
                onChange={handleInputChange}
              />
              {/* <FileUpload
                label="IQ Document"
                value={files.iq}
                onChange={(file) => setFiles(prev => ({ ...prev, iq: file }))}
              /> */}
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Operational Qualification (OQ)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="OQ Date"
                name="operationalQualification"
                value={formData.operationalQualification}
                onChange={handleInputChange}
              />
              {/* <FileUpload
                label="OQ Document"
                value={files.oq}
                onChange={(file) => setFiles(prev => ({ ...prev, oq: file }))}
              /> */}
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Performance Qualification (PQ)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DatePicker
                label="PQ Date"
                name="performanceQualification"
                value={formData.performanceQualification}
                onChange={handleInputChange}
              />
              {/* <FileUpload
                label="PQ Document"
                value={files.pq}
                onChange={(file) => setFiles(prev => ({ ...prev, pq: file }))}
              /> */}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create Equipment
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateEquipmentModal;