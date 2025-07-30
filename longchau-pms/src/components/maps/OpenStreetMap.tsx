import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { AddressService, Address } from '../../services/AddressService';
import { MapPin, Navigation, Search, Truck, Home, Building2, Route } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for different marker types
const createCustomIcon = (color: string, icon: string) => L.divIcon({
  html: `
    <div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      font-size: 14px;
    ">
      ${icon}
    </div>
  `,
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15]
});

const branchIcon = createCustomIcon('#3b82f6', '🏥');
const shipperIcon = createCustomIcon('#10b981', '🚚');
const customerIcon = createCustomIcon('#ef4444', '📍');
const searchIcon = createCustomIcon('#f59e0b', '🔍');

interface OpenStreetMapProps {
  orders?: Array<{
    id: string;
    customerName: string;
    destinationLocation?: {
      latitude: number;
      longitude: number;
      address: string;
    };
    originBranch?: {
      name: string;
      location: {
        latitude: number;
        longitude: number;
      };
    };
    assignedShipper?: {
      name: string;
      currentLocation?: {
        latitude: number;
        longitude: number;
      };
    };
    status: string;
  }>;
  selectedOrderId?: string;
  onOrderSelect?: (orderId: string) => void;
  showRoute?: boolean;
  centerLocation?: {
    latitude: number;
    longitude: number;
  };
}

// Component to handle map events and updates
function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

export default function OpenStreetMap({ 
  orders = [], 
  selectedOrderId, 
  onOrderSelect, 
  showRoute = true,
  centerLocation 
}: OpenStreetMapProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Address[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{lat: number, lng: number, address?: Address} | null>(null);

  // Default center (Ho Chi Minh City)
  const defaultCenter: [number, number] = [10.8231, 106.6297];
  const mapCenter: [number, number] = centerLocation 
    ? [centerLocation.latitude, centerLocation.longitude] 
    : defaultCenter;

  // Handle address search
  const handleAddressSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const geocodeResult = await AddressService.geocode(query);
      if (geocodeResult.success && geocodeResult.address) {
        setSearchResults([geocodeResult.address]);
        return;
      }

      // Fallback: search by city name
      const cityAddresses = AddressService.getAddressesByCity(query);
      setSearchResults(cityAddresses);
      
    } catch (error) {
      console.error('Address search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle address selection
  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setSearchQuery(address.fullAddress);
    setSearchResults([]);
  };

  // Handle map click for reverse geocoding
  const handleMapClick = async (lat: number, lng: number) => {
    try {
      const result = await AddressService.reverseGeocode(lat, lng);
      if (result.success && result.address) {
        setClickedLocation({ lat, lng, address: result.address });
      } else {
        setClickedLocation({ lat, lng });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      setClickedLocation({ lat, lng });
    }
  };

  // Get route polyline coordinates
  const getRouteCoordinates = (order: any): [number, number][] => {
    const coordinates: [number, number][] = [];
    
    if (order.originBranch?.location) {
      coordinates.push([
        order.originBranch.location.latitude,
        order.originBranch.location.longitude
      ]);
    }
    
    if (order.assignedShipper?.currentLocation) {
      coordinates.push([
        order.assignedShipper.currentLocation.latitude,
        order.assignedShipper.currentLocation.longitude
      ]);
    }
    
    if (order.destinationLocation) {
      coordinates.push([
        order.destinationLocation.latitude,
        order.destinationLocation.longitude
      ]);
    }
    
    return coordinates;
  };

  // Get status color for routes
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#6b7280';
      case 'confirmed': return '#f59e0b';
      case 'assigned': return '#3b82f6';
      case 'picked_up': return '#8b5cf6';
      case 'in_transit': return '#f97316';
      case 'delivered': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header with search */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
          <MapPin className="h-5 w-5 mr-2 text-blue-500" />
          Vietnam Delivery Map - OpenStreetMap
        </h3>
        
        {/* Address Search */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search addresses in Vietnam... (e.g., Ho Chi Minh City, District 1)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleAddressSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {searchResults.map((address, index) => (
                <button
                  key={index}
                  onClick={() => handleAddressSelect(address)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm">{address.street}</p>
                      <p className="text-xs text-gray-600">{address.ward}, {address.district}, {address.city}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 flex gap-2">
          <button
            onClick={() => {
              setSearchQuery('Ho Chi Minh City');
              handleAddressSearch('Ho Chi Minh City');
            }}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
          >
            HCMC
          </button>
          <button
            onClick={() => {
              setSearchQuery('Hanoi');
              handleAddressSearch('Hanoi');
            }}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
          >
            Hanoi
          </button>
          <button
            onClick={() => {
              setSearchQuery('Da Nang');
              handleAddressSearch('Da Nang');
            }}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-xs hover:bg-blue-200"
          >
            Da Nang
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          {orders.length} active deliveries • Click anywhere on map to get address
        </p>
      </div>

      {/* Map Container */}
      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* OpenStreetMap tiles */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Map click events */}
          <MapEvents onMapClick={handleMapClick} />

          {/* Selected address marker */}
          {selectedAddress && (
            <Marker
              position={[selectedAddress.coordinates.latitude, selectedAddress.coordinates.longitude]}
              icon={searchIcon}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-medium text-gray-900">🔍 Searched Location</h4>
                  <p className="text-sm text-gray-700">{selectedAddress.street}</p>
                  <p className="text-xs text-gray-600">{selectedAddress.ward}, {selectedAddress.district}</p>
                  <p className="text-xs text-gray-500">{selectedAddress.city}, {selectedAddress.province}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    📍 {selectedAddress.coordinates.latitude.toFixed(4)}, {selectedAddress.coordinates.longitude.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Clicked location marker */}
          {clickedLocation && (
            <Marker
              position={[clickedLocation.lat, clickedLocation.lng]}
              icon={customerIcon}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-medium text-gray-900">📍 Clicked Location</h4>
                  {clickedLocation.address ? (
                    <>
                      <p className="text-sm text-gray-700">{clickedLocation.address.street}</p>
                      <p className="text-xs text-gray-600">{clickedLocation.address.ward}, {clickedLocation.address.district}</p>
                      <p className="text-xs text-gray-500">{clickedLocation.address.city}, {clickedLocation.address.province}</p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-700">Getting address...</p>
                  )}
                  <p className="text-xs text-blue-600 mt-1">
                    📍 {clickedLocation.lat.toFixed(4)}, {clickedLocation.lng.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Order markers and routes */}
          {orders.map((order) => {
            const isSelected = selectedOrderId === order.id;
            const routeColor = getStatusColor(order.status);

            return (
              <React.Fragment key={order.id}>
                {/* Branch marker */}
                {order.originBranch && (
                  <Marker
                    position={[
                      order.originBranch.location.latitude,
                      order.originBranch.location.longitude
                    ]}
                    icon={branchIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Building2 className="h-4 w-4 mr-1" />
                          {order.originBranch.name}
                        </h4>
                        <p className="text-sm text-gray-700">Origin Branch</p>
                        <p className="text-xs text-gray-600">Order: #{order.id}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Shipper marker */}
                {order.assignedShipper?.currentLocation && (
                  <Marker
                    position={[
                      order.assignedShipper.currentLocation.latitude,
                      order.assignedShipper.currentLocation.longitude
                    ]}
                    icon={shipperIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Truck className="h-4 w-4 mr-1" />
                          {order.assignedShipper.name}
                        </h4>
                        <p className="text-sm text-gray-700">Shipper Location</p>
                        <p className="text-xs text-gray-600">Order: #{order.id}</p>
                        <p className="text-xs text-gray-500">Status: {order.status}</p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Customer destination marker */}
                {order.destinationLocation && (
                  <Marker
                    position={[
                      order.destinationLocation.latitude,
                      order.destinationLocation.longitude
                    ]}
                    icon={customerIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-medium text-gray-900 flex items-center">
                          <Home className="h-4 w-4 mr-1" />
                          {order.customerName}
                        </h4>
                        <p className="text-sm text-gray-700">Delivery Address</p>
                        <p className="text-xs text-gray-600">{order.destinationLocation.address}</p>
                        <p className="text-xs text-gray-500">Order: #{order.id}</p>
                        <button
                          onClick={() => onOrderSelect?.(order.id)}
                          className="mt-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                        >
                          Select Order
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Route polyline */}
                {showRoute && (
                  <Polyline
                    positions={getRouteCoordinates(order)}
                    pathOptions={{
                      color: routeColor,
                      weight: isSelected ? 4 : 2,
                      opacity: isSelected ? 0.8 : 0.6,
                      dashArray: order.status === 'delivered' ? undefined : '10, 10'
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>🏥 Pharmacy Branch</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>🚚 Shipper Location</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>📍 Customer Address</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>🔍 Searched Location</span>
          </div>
        </div>
      </div>
    </div>
  );
}
