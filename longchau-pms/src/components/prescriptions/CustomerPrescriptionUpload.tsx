import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import StorageStatus from '../common/StorageStatus';
import { 
  Upload, 
  FileText, 
  Camera, 
  Check, 
  AlertCircle,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Database,
  Save
} from 'lucide-react';

export default function CustomerPrescriptionUpload() {
  const { user } = useAuth();
  const { prescriptions, addPrescription, customers, isConnectedToDatabase } = useData();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [medications, setMedications] = useState([
    { productName: '', dosage: '', quantity: 1, instructions: '' }
  ]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storageResult, setStorageResult] = useState<string>('');

  // Filter prescriptions for current customer
  const customerPrescriptions = prescriptions.filter(p => p.customerId === user?.id);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addMedication = () => {
    setMedications([...medications, { productName: '', dosage: '', quantity: 1, instructions: '' }]);
  };

  const updateMedication = (index: number, field: string, value: string | number) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    );
    setMedications(updated);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setStorageResult('');

    const customer = customers.find(c => c.id === user.id);
    if (!customer) {
      setIsSubmitting(false);
      return;
    }

    const validMedications = medications.filter(med => 
      med.productName.trim() && med.dosage.trim()
    );

    if (validMedications.length === 0) {
      alert('Please add at least one medication.');
      setIsSubmitting(false);
      return;
    }

    const prescription = {
      customerId: user.id,
      customerName: customer.name,
      medications: validMedications.map(med => ({
        productId: '',
        productName: med.productName,
        dosage: med.dosage,
        quantity: med.quantity,
        instructions: med.instructions
      })),
      status: 'pending' as const,
      uploadDate: new Date().toISOString(),
      imageUrl: preview || undefined
    };

    try {
      const result = await addPrescription(prescription);
      
      if (result.stored === 'database') {
        setStorageResult('✅ Prescription successfully stored in database');
      } else {
        setStorageResult('⚠️ Prescription stored locally (will sync when database is available)');
      }
      
      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setMedications([{ productName: '', dosage: '', quantity: 1, instructions: '' }]);
      setUploadSuccess(true);
      
      setTimeout(() => {
        setUploadSuccess(false);
        setStorageResult('');
      }, 5000);
    } catch (error) {
      setStorageResult('❌ Error uploading prescription');
      setTimeout(() => setStorageResult(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'validated': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'dispensed': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'validated': return 'bg-green-100 text-green-800';
      case 'dispensed': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {uploadSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Prescription Uploaded Successfully!</h3>
            <p className="text-sm text-green-700">Your prescription has been submitted for pharmacist review.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Upload className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Upload Prescription</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prescription Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="prescription-upload"
                />
                <label htmlFor="prescription-upload" className="cursor-pointer">
                  {preview ? (
                    <div className="space-y-3">
                      <img src={preview} alt="Prescription preview" className="max-h-40 mx-auto rounded-lg" />
                      <p className="text-sm text-gray-600">Click to change image</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Upload prescription image</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Medications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Medications
                </label>
                <button
                  type="button"
                  onClick={addMedication}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  + Add Medication
                </button>
              </div>
              
              <div className="space-y-4">
                {medications.map((med, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Medication {index + 1}</span>
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Medication name"
                        value={med.productName}
                        onChange={(e) => updateMedication(index, 'productName', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Dosage (e.g., 500mg)"
                        value={med.dosage}
                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={med.quantity}
                        onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Instructions"
                        value={med.instructions}
                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Save className="h-4 w-4 animate-spin" />
                  <span>Saving to {isConnectedToDatabase ? 'Database' : 'Local Storage'}...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Submit Prescription</span>
                </>
              )}
            </button>

            {/* Storage Status Feedback */}
            {storageResult && (
              <div className={`p-3 rounded-lg text-sm ${
                storageResult.includes('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : storageResult.includes('⚠️')
                  ? 'bg-orange-50 text-orange-700 border border-orange-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {storageResult}
              </div>
            )}

            {/* Compact Storage Status */}
            <div className="border-t pt-4">
              <StorageStatus compact />
            </div>
          </form>
        </div>

        {/* Prescription History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-bold text-gray-900">My Prescriptions</h2>
          </div>

          <div className="space-y-4">
            {customerPrescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No prescriptions uploaded yet</p>
                <p className="text-sm text-gray-400">Upload your first prescription to get started</p>
              </div>
            ) : (
              customerPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(prescription.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                          {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                        </span>
                      </div>
                      
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Prescription ID: {prescription.id}
                      </p>
                      
                      <p className="text-xs text-gray-600 mb-2">
                        Uploaded: {new Date(prescription.uploadDate).toLocaleDateString('vi-VN')}
                      </p>
                      
                      <div className="text-xs text-gray-600">
                        <p className="font-medium">Medications:</p>
                        {prescription.medications.slice(0, 2).map((med, index) => (
                          <p key={index}>• {med.productName} - {med.dosage}</p>
                        ))}
                        {prescription.medications.length > 2 && (
                          <p>• +{prescription.medications.length - 2} more</p>
                        )}
                      </div>
                      
                      {prescription.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <span className="font-medium">Pharmacist Notes:</span> {prescription.notes}
                        </div>
                      )}
                    </div>
                    
                    {prescription.imageUrl && (
                      <button
                        onClick={() => window.open(prescription.imageUrl, '_blank')}
                        className="ml-3 text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
