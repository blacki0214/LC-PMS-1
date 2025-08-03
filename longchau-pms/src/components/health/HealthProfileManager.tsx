import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import { db } from '../../lib/db';
import { customers } from '../../lib/schema';
import { eq } from 'drizzle-orm';

interface HealthProfile {
  age?: number;
  gender?: 'male' | 'female' | 'other';
  weight?: number;
  height?: number;
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

const HealthProfileManager: React.FC = () => {
  const { user } = useAuth();
  const { updateCustomer } = useData();
  const [profile, setProfile] = useState<HealthProfile>({
    allergies: [],
    chronicConditions: [],
    currentMedications: []
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newMedication, setNewMedication] = useState('');

  useEffect(() => {
    if (user) {
      loadHealthProfile();
    }
  }, [user]);

  const loadHealthProfile = async () => {
    try {
      // Load customer data from database instead of user
      const customerData = await db.select()
        .from(customers)
        .where(eq(customers.id, user!.id))
        .limit(1);
      
      if (customerData.length > 0) {
        const customer = customerData[0];
        const healthStatus = customer.healthStatus ? 
          (typeof customer.healthStatus === 'string' 
            ? JSON.parse(customer.healthStatus) 
            : customer.healthStatus) : {};
        
        setProfile({
          age: healthStatus.age,
          gender: healthStatus.gender,
          weight: healthStatus.weight,
          height: healthStatus.height,
          bloodType: healthStatus.bloodType,
          allergies: customer.allergies || [],
          chronicConditions: healthStatus.chronicConditions || [],
          currentMedications: healthStatus.currentMedications || [],
          emergencyContact: healthStatus.emergencyContact
        });
      }
    } catch (error) {
      console.error('Error loading health profile:', error);
    }
  };

  const saveHealthProfile = async () => {
    try {
      setLoading(true);
      
      const healthStatus = {
        age: profile.age,
        gender: profile.gender,
        weight: profile.weight,
        height: profile.height,
        bloodType: profile.bloodType,
        chronicConditions: profile.chronicConditions,
        currentMedications: profile.currentMedications,
        emergencyContact: profile.emergencyContact
      };

      // Update customer with new health information
      await db.update(customers)
        .set({
          healthStatus: JSON.stringify(healthStatus),
          allergies: profile.allergies
        })
        .where(eq(customers.id, user!.id));

      setIsEditing(false);
      alert('Health profile updated successfully!');
    } catch (error) {
      console.error('Error saving health profile:', error);
      alert('Failed to save health profile');
    } finally {
      setLoading(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !profile.allergies.includes(newAllergy.trim())) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const addCondition = () => {
    if (newCondition.trim() && !profile.chronicConditions.includes(newCondition.trim())) {
      setProfile(prev => ({
        ...prev,
        chronicConditions: [...prev.chronicConditions, newCondition.trim()]
      }));
      setNewCondition('');
    }
  };

  const removeCondition = (condition: string) => {
    setProfile(prev => ({
      ...prev,
      chronicConditions: prev.chronicConditions.filter(c => c !== condition)
    }));
  };

  const addMedication = () => {
    if (newMedication.trim() && !profile.currentMedications.includes(newMedication.trim())) {
      setProfile(prev => ({
        ...prev,
        currentMedications: [...prev.currentMedications, newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    setProfile(prev => ({
      ...prev,
      currentMedications: prev.currentMedications.filter(m => m !== medication)
    }));
  };

  if (user?.role !== 'customer') {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Health profile is only available for customers.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">Health Profile</h1>
            <p className="text-green-100">Manage your health information for personalized recommendations</p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            {isEditing ? (
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || undefined }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter age"
              />
            ) : (
              <p className="text-gray-900">{profile.age || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            {isEditing ? (
              <select
                value={profile.gender || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <p className="text-gray-900">{profile.gender || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            {isEditing ? (
              <input
                type="number"
                value={profile.weight || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter weight"
              />
            ) : (
              <p className="text-gray-900">{profile.weight ? `${profile.weight} kg` : 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
            {isEditing ? (
              <select
                value={profile.bloodType || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, bloodType: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            ) : (
              <p className="text-gray-900">{profile.bloodType || 'Not specified'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Allergies */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Allergies</h2>
        {isEditing && (
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newAllergy}
              onChange={(e) => setNewAllergy(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add allergy (e.g., Penicillin, Shellfish)"
            />
            <button
              onClick={addAllergy}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {profile.allergies.length === 0 ? (
            <p className="text-gray-500">No allergies recorded</p>
          ) : (
            profile.allergies.map((allergy, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm"
              >
                {allergy}
                {isEditing && (
                  <button
                    onClick={() => removeAllergy(allergy)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Chronic Conditions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chronic Conditions</h2>
        {isEditing && (
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newCondition}
              onChange={(e) => setNewCondition(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCondition()}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add condition (e.g., Diabetes, Hypertension)"
            />
            <button
              onClick={addCondition}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {profile.chronicConditions.length === 0 ? (
            <p className="text-gray-500">No chronic conditions recorded</p>
          ) : (
            profile.chronicConditions.map((condition, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm"
              >
                {condition}
                {isEditing && (
                  <button
                    onClick={() => removeCondition(condition)}
                    className="ml-2 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Current Medications */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Medications</h2>
        {isEditing && (
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newMedication}
              onChange={(e) => setNewMedication(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addMedication()}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add medication (e.g., Lisinopril 10mg daily)"
            />
            <button
              onClick={addMedication}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {profile.currentMedications.length === 0 ? (
            <p className="text-gray-500">No current medications recorded</p>
          ) : (
            profile.currentMedications.map((medication, index) => (
              <span
                key={index}
                className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {medication}
                {isEditing && (
                  <button
                    onClick={() => removeMedication(medication)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => setIsEditing(false)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={saveHealthProfile}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}
    </div>
  );
};

export default HealthProfileManager;
