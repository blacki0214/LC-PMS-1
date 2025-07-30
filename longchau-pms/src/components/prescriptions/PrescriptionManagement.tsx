import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import { useActivity } from '../../contexts/ActivityContext';
import CustomerPrescriptionUpload from './CustomerPrescriptionUpload';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Upload,
  User,
  Calendar,
  MessageSquare,
  Pill,
  Check,
  X
} from 'lucide-react';

export default function PrescriptionManagement() {
  const { user } = useAuth();
  const { prescriptions, updatePrescription } = useData();
  const { addActivity } = useActivity();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showUpload, setShowUpload] = useState(false);

  // If customer wants to upload, show upload component
  if (user?.role === 'customer' && showUpload) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowUpload(false)}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Prescriptions
          </button>
        </div>
        <CustomerPrescriptionUpload />
      </div>
    );
  }

  // Filter prescriptions based on user role
  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = prescription.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescription.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || prescription.status === statusFilter;
    const matchesRole = user?.role === 'customer' 
      ? prescription.customerId === user.id 
      : true; // Pharmacists/admins see all
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const handleValidatePrescription = (prescriptionId: string, action: 'validated' | 'rejected', notes?: string) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return;

    const updatedPrescription = {
      ...prescription,
      status: action,
      pharmacistId: user?.id,
      pharmacistName: user?.name,
      validationDate: new Date().toISOString(),
      notes: notes || prescription.notes
    };

    updatePrescription(updatedPrescription);
    
    // Log the activity
    addActivity(
      'prescription',
      action === 'validated' ? 'Validated prescription' : 'Rejected prescription',
      `Prescription for "${prescription.customerName}" was ${action}`,
      {
        prescriptionId: prescription.id
      }
    );
    
    setSelectedPrescription(null);
    setNotes('');
  };

  const handleDispensePrescription = (prescriptionId: string) => {
    const prescription = prescriptions.find(p => p.id === prescriptionId);
    if (!prescription) return;

    const updatedPrescription = {
      ...prescription,
      status: 'dispensed' as const,
      dispensedDate: new Date().toISOString()
    };

    updatePrescription(updatedPrescription);
    
    // Log the activity
    addActivity(
      'prescription',
      'Dispensed prescription',
      `Prescription for "${prescription.customerName}" was dispensed`,
      {
        prescriptionId: prescription.id
      }
    );
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescription Management</h1>
          <p className="text-gray-600">
            {user?.role === 'customer' 
              ? 'View and upload your prescriptions'
              : 'Validate and manage patient prescriptions'
            }
          </p>
        </div>
        {user?.role === 'customer' && (
          <button 
            onClick={() => setShowUpload(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Prescription</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search prescriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="validated">Validated</option>
                <option value="dispensed">Dispensed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {filteredPrescriptions.length} prescription(s) found
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {filteredPrescriptions.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-500">
              {user?.role === 'customer' 
                ? 'Upload your first prescription to get started.'
                : 'No prescriptions match your current filters.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(prescription.status)}
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                          {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">ID: {prescription.id}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{prescription.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Uploaded: {new Date(prescription.uploadDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      {prescription.pharmacistName && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Pharmacist: {prescription.pharmacistName}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Medications */}
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Pill className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Medications:</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {prescription.medications.map((med, index) => (
                          <div key={index} className="text-sm bg-gray-50 rounded-lg p-3">
                            <div className="font-medium text-gray-900">{med.productName}</div>
                            <div className="text-gray-600">
                              {med.dosage} • Qty: {med.quantity}
                            </div>
                            {med.instructions && (
                              <div className="text-xs text-gray-500 mt-1">{med.instructions}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    {prescription.notes && (
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">Pharmacist Notes:</span>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm text-blue-800">{prescription.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {prescription.imageUrl && (
                      <button
                        onClick={() => window.open(prescription.imageUrl, '_blank')}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View prescription image"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}

                    {/* Pharmacist Actions */}
                    {user?.role !== 'customer' && prescription.status === 'pending' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedPrescription(prescription.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPrescription(prescription.id);
                            setNotes('');
                          }}
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}

                    {user?.role !== 'customer' && prescription.status === 'validated' && (
                      <button
                        onClick={() => handleDispensePrescription(prescription.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Mark Dispensed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Review Prescription
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this prescription..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleValidatePrescription(selectedPrescription, 'validated', notes)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleValidatePrescription(selectedPrescription, 'rejected', notes)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => {
                  setSelectedPrescription(null);
                  setNotes('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}