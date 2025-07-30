import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Truck, Home, Building2, Search, MapPinIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { AddressService, Address } from '../../services/AddressService';
import OpenStreetMap from './OpenStreetMap';

interface VietnamMapProps {
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

// Vietnam major cities coordinates for reference
const VIETNAM_CITIES = {
  'Ho Chi Minh City': { lat: 10.8231, lng: 106.6297 },
  'Hanoi': { lat: 21.0285, lng: 105.8542 },
  'Da Nang': { lat: 16.0471, lng: 108.2068 },
  'Can Tho': { lat: 10.0452, lng: 105.7469 },
  'Hai Phong': { lat: 20.8449, lng: 106.6881 },
  'Bien Hoa': { lat: 10.9447, lng: 106.8230 },
  'Hue': { lat: 16.4637, lng: 107.5909 },
  'Nha Trang': { lat: 12.2388, lng: 109.1967 },
  'Buon Ma Thuot': { lat: 12.6667, lng: 108.0500 },
  'Quy Nhon': { lat: 13.7563, lng: 109.2297 }
};

// Vietnam provinces boundaries (simplified)
const VIETNAM_BOUNDARIES = {
  north: 23.393,
  south: 8.180,
  east: 109.464,
  west: 102.145
};

export default function VietnamMap({ 
  orders = [], 
  selectedOrderId, 
  onOrderSelect, 
  showRoute = true,
  centerLocation 
}: VietnamMapProps) {
  const mapRef = useRef<SVGSVGElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(selectedOrderId || null);
  const [mapCenter, setMapCenter] = useState(centerLocation || VIETNAM_CITIES['Ho Chi Minh City']);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Address[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [useOpenStreetMap, setUseOpenStreetMap] = useState(true); // Toggle between SVG and OSM

  // Address search functionality
  const handleAddressSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // First try geocoding the search query
      const geocodeResult = await AddressService.geocode(query);
      if (geocodeResult.success && geocodeResult.address) {
        setSearchResults([geocodeResult.address]);
        return;
      }

      // Fallback: search by city name in our database
      const cityAddresses = AddressService.getAddressesByCity(query);
      setSearchResults(cityAddresses);
      
    } catch (error) {
      console.error('Address search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setMapCenter({
      lat: address.coordinates.latitude,
      lng: address.coordinates.longitude
    });
    setSearchQuery(address.fullAddress);
    setSearchResults([]);
  };

  const handleMapClick = async (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert SVG coordinates to lat/lng (simplified calculation)
    const lat = VIETNAM_BOUNDARIES.north - (y / rect.height) * (VIETNAM_BOUNDARIES.north - VIETNAM_BOUNDARIES.south);
    const lng = VIETNAM_BOUNDARIES.west + (x / rect.width) * (VIETNAM_BOUNDARIES.east - VIETNAM_BOUNDARIES.west);

    // Reverse geocode the clicked location
    try {
      const result = await AddressService.reverseGeocode(lat, lng);
      if (result.success && result.address) {
        setSelectedAddress(result.address);
        setSearchQuery(result.address.fullAddress);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
  };

  useEffect(() => {
    if (selectedOrderId) {
      setSelectedOrder(selectedOrderId);
    }
  }, [selectedOrderId]);

  const handleOrderClick = (orderId: string) => {
    setSelectedOrder(orderId);
    onOrderSelect?.(orderId);
    
    // Center map on selected order
    const order = orders.find(o => o.id === orderId);
    if (order?.destinationLocation) {
      setMapCenter({
        lat: order.destinationLocation.latitude,
        lng: order.destinationLocation.longitude
      });
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-500';
      case 'confirmed': return 'bg-yellow-500';
      case 'assigned': return 'bg-blue-500';
      case 'picked_up': return 'bg-purple-500';
      case 'in_transit': return 'bg-orange-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Convert lat/lng to SVG coordinates
  const latLngToSVG = (lat: number, lng: number, viewBox: { width: number; height: number }) => {
    const x = ((lng - VIETNAM_BOUNDARIES.west) / (VIETNAM_BOUNDARIES.east - VIETNAM_BOUNDARIES.west)) * viewBox.width;
    const y = ((VIETNAM_BOUNDARIES.north - lat) / (VIETNAM_BOUNDARIES.north - VIETNAM_BOUNDARIES.south)) * viewBox.height;
    return { x, y };
  };

  const svgViewBox = { width: 400, height: 600 };

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-blue-500" />
          Vietnam Delivery Map
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {orders.length} active deliveries • Real-time tracking
        </p>

        {/* Map Type Toggle */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Map View:</span>
            <button
              onClick={() => setUseOpenStreetMap(!useOpenStreetMap)}
              className="flex items-center space-x-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {useOpenStreetMap ? (
                <>
                  <ToggleRight className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-blue-600">OpenStreetMap</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">SVG Map</span>
                </>
              )}
            </button>
          </div>
          <div className="text-xs text-gray-500">
            {useOpenStreetMap ? 'Interactive map with real tiles' : 'Simple vector map'}
          </div>
        </div>

        {/* Address Search */}
        <div className="mt-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search addresses in Vietnam... (e.g., Ho Chi Minh City, Nguyen Hue Street)"
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
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((address, index) => (
                <button
                  key={index}
                  onClick={() => handleAddressSelect(address)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:bg-blue-50 focus:outline-none"
                >
                  <div className="flex items-start">
                    <MapPinIcon className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm">{address.street}</p>
                      <p className="text-xs text-gray-600">{address.ward}, {address.district}</p>
                      <p className="text-xs text-gray-500">{address.city}, {address.province}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Address Info */}
          {selectedAddress && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <MapPinIcon className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-blue-900 text-sm">{selectedAddress.street}</p>
                  <p className="text-xs text-blue-700">{selectedAddress.ward}, {selectedAddress.district}, {selectedAddress.city}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    📍 {selectedAddress.coordinates.latitude.toFixed(4)}, {selectedAddress.coordinates.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conditional Map Rendering */}
      {useOpenStreetMap ? (
        <OpenStreetMap
          orders={orders}
          selectedOrderId={selectedOrderId}
          onOrderSelect={onOrderSelect}
          showRoute={showRoute}
          centerLocation={centerLocation}
        />
      ) : (
        <>
          {/* Original SVG Map */}
          <div className="relative">
        {/* SVG Map of Vietnam */}
        <svg
          ref={mapRef}
          viewBox={`0 0 ${svgViewBox.width} ${svgViewBox.height}`}
          className="w-full h-96 bg-blue-50 cursor-crosshair"
          onClick={handleMapClick}
        >
          {/* Vietnam country outline (simplified) */}
          <path
            d="M80,50 L320,50 L350,80 L380,150 L370,200 L360,250 L350,300 L340,350 L320,400 L300,450 L280,500 L250,530 L200,550 L150,530 L120,500 L100,450 L90,400 L85,350 L80,300 L75,250 L70,200 L75,150 L80,100 Z"
            fill="#e0f2fe"
            stroke="#0369a1"
            strokeWidth="2"
            className="drop-shadow-sm"
          />

          {/* Major cities */}
          {Object.entries(VIETNAM_CITIES).map(([cityName, coords]) => {
            const svgCoords = latLngToSVG(coords.lat, coords.lng, svgViewBox);
            return (
              <g key={cityName}>
                <circle
                  cx={svgCoords.x}
                  cy={svgCoords.y}
                  r="3"
                  fill="#64748b"
                  className="opacity-50"
                />
                <text
                  x={svgCoords.x + 5}
                  y={svgCoords.y - 5}
                  fontSize="8"
                  fill="#374151"
                  className="text-xs font-medium"
                >
                  {cityName}
                </text>
              </g>
            );
          })}

          {/* Order markers and routes */}
          {orders.map((order) => {
            if (!order.destinationLocation) return null;

            const destCoords = latLngToSVG(
              order.destinationLocation.latitude,
              order.destinationLocation.longitude,
              svgViewBox
            );

            const isSelected = selectedOrder === order.id;
            const statusColor = getOrderStatusColor(order.status);

            return (
              <g key={order.id}>
                {/* Route line from branch to destination */}
                {showRoute && order.originBranch && (
                  (() => {
                    const originCoords = latLngToSVG(
                      order.originBranch.location.latitude,
                      order.originBranch.location.longitude,
                      svgViewBox
                    );
                    return (
                      <line
                        x1={originCoords.x}
                        y1={originCoords.y}
                        x2={destCoords.x}
                        y2={destCoords.y}
                        stroke={isSelected ? "#3b82f6" : "#9ca3af"}
                        strokeWidth={isSelected ? "3" : "1"}
                        strokeDasharray="5,5"
                        className="opacity-60"
                      />
                    );
                  })()
                )}

                {/* Branch marker */}
                {order.originBranch && (
                  (() => {
                    const originCoords = latLngToSVG(
                      order.originBranch.location.latitude,
                      order.originBranch.location.longitude,
                      svgViewBox
                    );
                    return (
                      <g>
                        <circle
                          cx={originCoords.x}
                          cy={originCoords.y}
                          r="6"
                          fill="#10b981"
                          className="drop-shadow-sm"
                        />
                        <circle
                          cx={originCoords.x}
                          cy={originCoords.y}
                          r="3"
                          fill="white"
                        />
                      </g>
                    );
                  })()
                )}

                {/* Shipper current location */}
                {order.assignedShipper?.currentLocation && (
                  (() => {
                    const shipperCoords = latLngToSVG(
                      order.assignedShipper.currentLocation.latitude,
                      order.assignedShipper.currentLocation.longitude,
                      svgViewBox
                    );
                    return (
                      <g>
                        <circle
                          cx={shipperCoords.x}
                          cy={shipperCoords.y}
                          r="8"
                          fill="#3b82f6"
                          className="animate-pulse drop-shadow-sm"
                        />
                        <circle
                          cx={shipperCoords.x}
                          cy={shipperCoords.y}
                          r="4"
                          fill="white"
                        />
                      </g>
                    );
                  })()
                )}

                {/* Destination marker */}
                <circle
                  cx={destCoords.x}
                  cy={destCoords.y}
                  r={isSelected ? "10" : "8"}
                  fill={statusColor.replace('bg-', '#')}
                  className={`cursor-pointer transition-all duration-200 ${isSelected ? 'drop-shadow-lg' : 'drop-shadow-sm'} hover:r-12`}
                  onClick={() => handleOrderClick(order.id)}
                />
                <circle
                  cx={destCoords.x}
                  cy={destCoords.y}
                  r={isSelected ? "5" : "4"}
                  fill="white"
                />

                {/* Order ID label */}
                {isSelected && (
                  <text
                    x={destCoords.x}
                    y={destCoords.y - 15}
                    fontSize="10"
                    fill="#374151"
                    textAnchor="middle"
                    className="font-semibold"
                  >
                    #{order.id}
                  </text>
                )}
              </g>
            );
          })}

          {/* Selected Address Marker */}
          {selectedAddress && (
            (() => {
              const addressCoords = latLngToSVG(
                selectedAddress.coordinates.latitude,
                selectedAddress.coordinates.longitude,
                svgViewBox
              );
              return (
                <g>
                  {/* Address marker with search icon */}
                  <circle
                    cx={addressCoords.x}
                    cy={addressCoords.y}
                    r="12"
                    fill="#ef4444"
                    className="drop-shadow-lg animate-pulse"
                  />
                  <circle
                    cx={addressCoords.x}
                    cy={addressCoords.y}
                    r="6"
                    fill="white"
                  />
                  <circle
                    cx={addressCoords.x}
                    cy={addressCoords.y}
                    r="2"
                    fill="#ef4444"
                  />

                  {/* Address label */}
                  <text
                    x={addressCoords.x}
                    y={addressCoords.y - 20}
                    fontSize="10"
                    fill="#374151"
                    textAnchor="middle"
                    className="font-semibold bg-white"
                  >
                    📍 {selectedAddress.city}
                  </text>
                </g>
              );
            })()
          )}
        </svg>

        {/* Map controls */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border p-2">
          <div className="flex flex-col space-y-2">
            <button className="p-1 hover:bg-gray-100 rounded text-gray-600">
              <Navigation className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Locations</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Pharmacy Branch</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-gray-600">Shipper Location</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-gray-600">Customer Address</span>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Status</h4>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-gray-600">In Transit</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Delivered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Assigned</span>
            </div>
          </div>
        </div>
      </div>

          {/* Selected order details - SVG Map Only */}
          {selectedOrder && (
            <div className="p-4 border-t">
              {(() => {
                const order = orders.find(o => o.id === selectedOrder);
                if (!order) return null;

                return (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-semibold text-gray-900 mb-2">Order #{order.id}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Customer:</p>
                        <p className="font-medium">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status:</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getOrderStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      {order.assignedShipper && (
                        <div>
                          <p className="text-gray-600">Shipper:</p>
                          <p className="font-medium">{order.assignedShipper.name}</p>
                        </div>
                      )}
                      {order.destinationLocation && (
                        <div>
                          <p className="text-gray-600">Distance:</p>
                          <p className="font-medium">
                            {order.originBranch ? 
                              `${calculateDistance(
                                order.originBranch.location.latitude,
                                order.originBranch.location.longitude,
                                order.destinationLocation.latitude,
                                order.destinationLocation.longitude
                              ).toFixed(1)} km` : 
                              'Calculating...'
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
