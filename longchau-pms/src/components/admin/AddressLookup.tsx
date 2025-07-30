import React, { useState } from 'react';
import { AddressService, Address } from '../../services/AddressService';
import { MapPin, Search, Navigation, Globe, Phone, CheckCircle } from 'lucide-react';

export default function AddressLookup() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [reverseGeocodeResult, setReverseGeocodeResult] = useState<Address | null>(null);
  const [testCoordinates, setTestCoordinates] = useState({ lat: '', lng: '' });

  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const result = await AddressService.geocode(searchQuery);
      if (result.success && result.address) {
        setSearchResults([result.address]);
        setSelectedAddress(result.address);
      } else {
        // Fallback: search by city
        const cityResults = AddressService.getAddressesByCity(searchQuery);
        setSearchResults(cityResults);
        if (cityResults.length > 0) {
          setSelectedAddress(cityResults[0]);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReverseGeocode = async () => {
    const lat = parseFloat(testCoordinates.lat);
    const lng = parseFloat(testCoordinates.lng);

    if (isNaN(lat) || isNaN(lng)) return;

    setIsLoading(true);
    try {
      const result = await AddressService.reverseGeocode(lat, lng);
      if (result.success && result.address) {
        setReverseGeocodeResult(result.address);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRandomAddress = () => {
    const randomAddr = AddressService.getRandomVietnameseAddress();
    setSelectedAddress(randomAddr);
    setSearchQuery(randomAddr.fullAddress);
  };

  const testPhoneValidation = (phone: string) => {
    return AddressService.validateVietnamesePhone(phone);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg border">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Globe className="h-6 w-6 mr-3 text-blue-500" />
            Vietnam Address Lookup API
          </h2>
          <p className="text-gray-600 mt-2">
            Search Vietnamese addresses, reverse geocoding, and address validation
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Forward Geocoding - Address Search */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Address Search (Forward Geocoding)
            </h3>
            
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search: Ho Chi Minh City, Nguyen Hue Street, District 1..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleAddressSearch}
                disabled={isLoading || !searchQuery.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </button>
              <button
                onClick={getRandomAddress}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Random
              </button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-blue-800">Search Results:</h4>
                {searchResults.map((address, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedAddress(address)}
                    className="p-3 bg-white border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{address.street}</p>
                        <p className="text-sm text-gray-600">{address.ward}, {address.district}</p>
                        <p className="text-sm text-gray-500">{address.city}, {address.province}</p>
                        <p className="text-xs text-blue-600 mt-1">
                          📍 {address.coordinates.latitude.toFixed(4)}, {address.coordinates.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reverse Geocoding */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
              <Navigation className="h-5 w-5 mr-2" />
              Reverse Geocoding (Coordinates to Address)
            </h3>
            
            <div className="flex gap-3 mb-4">
              <input
                type="number"
                placeholder="Latitude (e.g., 10.8231)"
                value={testCoordinates.lat}
                onChange={(e) => setTestCoordinates({...testCoordinates, lat: e.target.value})}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                step="0.0001"
              />
              <input
                type="number"
                placeholder="Longitude (e.g., 106.6297)"
                value={testCoordinates.lng}
                onChange={(e) => setTestCoordinates({...testCoordinates, lng: e.target.value})}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                step="0.0001"
              />
              <button
                onClick={handleReverseGeocode}
                disabled={isLoading || !testCoordinates.lat || !testCoordinates.lng}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Navigation className="h-4 w-4 mr-2" />
                )}
                Lookup
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setTestCoordinates({ lat: '10.8231', lng: '106.6297' })}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
              >
                Ho Chi Minh City
              </button>
              <button
                onClick={() => setTestCoordinates({ lat: '21.0285', lng: '105.8542' })}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
              >
                Hanoi
              </button>
              <button
                onClick={() => setTestCoordinates({ lat: '16.0471', lng: '108.2068' })}
                className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
              >
                Da Nang
              </button>
            </div>

            {reverseGeocodeResult && (
              <div className="p-3 bg-white border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Address Found:</h4>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">{reverseGeocodeResult.street}</p>
                    <p className="text-sm text-gray-600">{reverseGeocodeResult.ward}, {reverseGeocodeResult.district}</p>
                    <p className="text-sm text-gray-500">{reverseGeocodeResult.city}, {reverseGeocodeResult.province}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Phone Validation */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center">
              <Phone className="h-5 w-5 mr-2" />
              Vietnamese Phone Validation
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                '+84901234567',
                '0901234567', 
                '84901234567',
                '+84281234567',
                '0281234567',
                '1234567890',
                '+1234567890'
              ].map((phone, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white border border-purple-200 rounded">
                  <span className="font-mono text-sm">{phone}</span>
                  <div className="flex items-center">
                    {testPhoneValidation(phone) ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full bg-red-500" />
                    )}
                    <span className="ml-2 text-xs font-medium">
                      {testPhoneValidation(phone) ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Address Details */}
          {selectedAddress && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Selected Address Details
              </h3>
              
              <div className="bg-white border border-yellow-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Address Components</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Street:</span> {selectedAddress.street}</p>
                      <p><span className="font-medium">Ward:</span> {selectedAddress.ward}</p>
                      <p><span className="font-medium">District:</span> {selectedAddress.district}</p>
                      <p><span className="font-medium">City:</span> {selectedAddress.city}</p>
                      <p><span className="font-medium">Province:</span> {selectedAddress.province}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Coordinates & Format</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Latitude:</span> {selectedAddress.coordinates.latitude}</p>
                      <p><span className="font-medium">Longitude:</span> {selectedAddress.coordinates.longitude}</p>
                      <p><span className="font-medium">Formatted:</span> {AddressService.formatAddress(selectedAddress)}</p>
                      <p><span className="font-medium">Full:</span> {selectedAddress.fullAddress}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
