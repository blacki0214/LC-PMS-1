import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import { 
  User,
  Heart,
  Shield,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Award,
  Briefcase,
  GraduationCap,
  Building,
  Clock,
  Star,
  TrendingUp,
  Edit,
  Save,
  X
} from 'lucide-react';

interface CustomerProfileProps {
  customer: any;
  isOwnProfile?: boolean;
}

function CustomerProfile({ customer, isOwnProfile = false }: CustomerProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(customer);

  const getBMI = () => {
    if (customer.healthStatus?.height && customer.healthStatus?.weight) {
      const heightInM = customer.healthStatus.height / 100;
      const bmi = customer.healthStatus.weight / (heightInM * heightInM);
      return bmi.toFixed(1);
    }
    return 'N/A';
  };

  const getBMIStatus = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { status: 'Underweight', color: 'text-blue-600' };
    if (bmiValue < 25) return { status: 'Normal', color: 'text-green-600' };
    if (bmiValue < 30) return { status: 'Overweight', color: 'text-yellow-600' };
    return { status: 'Obese', color: 'text-red-600' };
  };

  const getMembershipColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'text-amber-600 bg-amber-50';
      case 'silver': return 'text-gray-600 bg-gray-50';
      case 'gold': return 'text-yellow-600 bg-yellow-50';
      case 'platinum': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const bmi = getBMI();
  const bmiStatus = getBMIStatus(bmi);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMembershipColor(customer.membershipTier)}`}>
              <Star className="h-4 w-4 mr-1" />
              {customer.membershipTier.toUpperCase()} MEMBER
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Personal Information
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{customer.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{customer.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{customer.address}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                {new Date(customer.dateOfBirth).toLocaleDateString('vi-VN')} 
                <span className="text-sm text-gray-500 ml-2">({calculateAge(customer.dateOfBirth)} years old)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Health Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-red-600" />
            Health Information
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {customer.healthStatus?.bloodType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Blood Type:</span>
                <span className="font-medium text-red-600">{customer.healthStatus.bloodType}</span>
              </div>
            )}
            
            {customer.healthStatus?.height && customer.healthStatus?.weight && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Height:</span>
                  <span className="font-medium">{customer.healthStatus.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weight:</span>
                  <span className="font-medium">{customer.healthStatus.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">BMI:</span>
                  <span className={`font-medium ${bmiStatus.color}`}>
                    {bmi} ({bmiStatus.status})
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Allergies & Conditions */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600" />
            Medical Alerts
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">Allergies:</span>
              {customer.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {customer.allergies.map((allergy: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 text-sm">No known allergies</span>
              )}
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">Chronic Conditions:</span>
              {customer.healthStatus?.chronicConditions?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {customer.healthStatus.chronicConditions.map((condition: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {condition}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 text-sm">No chronic conditions</span>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Emergency Contact
          </h3>
          
          {customer.healthStatus?.emergencyContact ? (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{customer.healthStatus.emergencyContact.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{customer.healthStatus.emergencyContact.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Relationship:</span>
                <span className="font-medium">{customer.healthStatus.emergencyContact.relationship}</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              <span className="text-gray-500 text-sm">No emergency contact information</span>
            </div>
          )}
        </div>

        {/* Insurance Info */}
        {customer.healthStatus?.insurance && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Insurance Information
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium">{customer.healthStatus.insurance.provider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Policy Number:</span>
                <span className="font-medium">{customer.healthStatus.insurance.policyNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expiry Date:</span>
                <span className="font-medium">
                  {new Date(customer.healthStatus.insurance.expiryDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Membership Stats */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
            Membership Statistics
          </h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Member Since:</span>
              <span className="font-medium">
                {new Date(customer.joinDate).toLocaleDateString('vi-VN')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Spent:</span>
              <span className="font-medium text-green-600">
                {formatCurrency(customer.totalSpent)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Orders:</span>
              <span className="font-medium">{customer.orderHistory?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prescriptions:</span>
              <span className="font-medium">{customer.prescriptionHistory?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfessionalProfileProps {
  user: any;
  isOwnProfile?: boolean;
}

function ProfessionalProfile({ user, isOwnProfile = false }: ProfessionalProfileProps) {
  const [isEditing, setIsEditing] = useState(false);

  const calculateExperience = () => {
    if (user.professionalInfo?.hireDate) {
      const hireDate = new Date(user.professionalInfo.hireDate);
      const now = new Date();
      const yearsDiff = now.getFullYear() - hireDate.getFullYear();
      return yearsDiff;
    }
    return user.professionalInfo?.yearsOfExperience || 0;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'pharmacist': return 'text-blue-600 bg-blue-50';
      case 'manager': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
              <Briefcase className="h-4 w-4 mr-1" />
              {user.role.toUpperCase()}
            </div>
          </div>
        </div>
        {isOwnProfile && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {user.professionalInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
              Professional Information
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Position:</span>
                <span className="font-medium">{user.professionalInfo.position}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">License Number:</span>
                <span className="font-medium">{user.professionalInfo.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{user.professionalInfo.department || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium text-green-600">
                  {calculateExperience()} years
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Hire Date:</span>
                <span className="font-medium">
                  {new Date(user.professionalInfo.hireDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Branch Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building className="h-5 w-5 mr-2 text-green-600" />
              Branch Information
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Branch:</span>
                <span className="font-medium">{user.professionalInfo.branch.name}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium text-right max-w-xs">
                  {user.professionalInfo.branch.address}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{user.professionalInfo.branch.phone}</span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <GraduationCap className="h-5 w-5 mr-2 text-purple-600" />
              Education
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Degree:</span>
                <span className="font-medium">{user.professionalInfo.education.degree}</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="text-gray-600">Institution:</span>
                <span className="font-medium text-right max-w-xs">
                  {user.professionalInfo.education.institution}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Graduation:</span>
                <span className="font-medium">{user.professionalInfo.education.graduationYear}</span>
              </div>
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Specializations
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {user.professionalInfo.specializations.map((spec: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="space-y-4 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Award className="h-5 w-5 mr-2 text-green-600" />
              Certifications
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                {user.professionalInfo.certifications.map((cert: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <User className="h-5 w-5 mr-2 text-gray-600" />
          Contact Information
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfileView() {
  const { user } = useAuth();
  const { customers } = useData();

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  // For customers, show their health profile
  if (user.role === 'customer') {
    const customerData = customers.find(c => c.id === user.id);
    if (!customerData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Customer profile not found.</p>
        </div>
      );
    }
    return <CustomerProfile customer={customerData} isOwnProfile={true} />;
  }

  // For pharmacists and managers, show their professional profile
  return <ProfessionalProfile user={user} isOwnProfile={true} />;
}
