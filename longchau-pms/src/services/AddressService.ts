export interface Address {
  street: string;
  ward: string;
  district: string;
  city: string;
  province: string;
  fullAddress: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface GeocodeResult {
  success: boolean;
  address?: Address;
  error?: string;
}

export class AddressService {
  // OpenStreetMap Nominatim API (free alternative to Google Maps)
  private static readonly NOMINATIM_API = 'https://nominatim.openstreetmap.org';
  
  // Backup: Vietnam province and city data
  private static readonly VIETNAM_ADDRESSES = [
    // Ho Chi Minh City addresses
    {
      street: '123 Nguyen Hue',
      ward: 'Ben Nghe',
      district: 'District 1',
      city: 'Ho Chi Minh City',
      province: 'Ho Chi Minh City',
      coordinates: { latitude: 10.8231, longitude: 106.6297 }
    },
    {
      street: '456 Le Loi',
      ward: 'Ben Thanh',
      district: 'District 1', 
      city: 'Ho Chi Minh City',
      province: 'Ho Chi Minh City',
      coordinates: { latitude: 10.8205, longitude: 106.6250 }
    },
    {
      street: '789 Dong Khoi',
      ward: 'Ben Nghe',
      district: 'District 1',
      city: 'Ho Chi Minh City', 
      province: 'Ho Chi Minh City',
      coordinates: { latitude: 10.8224, longitude: 106.6289 }
    },
    {
      street: '321 Vo Van Tan',
      ward: 'Vo Thi Sau',
      district: 'District 3',
      city: 'Ho Chi Minh City',
      province: 'Ho Chi Minh City', 
      coordinates: { latitude: 10.7889, longitude: 106.6917 }
    },
    {
      street: '654 Cach Mang Thang Tam',
      ward: 'Ward 6',
      district: 'District 3',
      city: 'Ho Chi Minh City',
      province: 'Ho Chi Minh City',
      coordinates: { latitude: 10.7831, longitude: 106.6734 }
    },
    
    // Hanoi addresses
    {
      street: '88 Hoan Kiem',
      ward: 'Hang Bong',
      district: 'Hoan Kiem District',
      city: 'Hanoi',
      province: 'Hanoi',
      coordinates: { latitude: 21.0285, longitude: 105.8542 }
    },
    {
      street: '234 Ba Dinh',
      ward: 'Kim Ma',
      district: 'Ba Dinh District',
      city: 'Hanoi',
      province: 'Hanoi',
      coordinates: { latitude: 21.0333, longitude: 105.8340 }
    },
    {
      street: '567 Dong Da',
      ward: 'Lang Ha',
      district: 'Dong Da District', 
      city: 'Hanoi',
      province: 'Hanoi',
      coordinates: { latitude: 21.0136, longitude: 105.8175 }
    },
    
    // Da Nang addresses
    {
      street: '111 Han River',
      ward: 'An Hai Bac',
      district: 'Son Tra District',
      city: 'Da Nang',
      province: 'Da Nang',
      coordinates: { latitude: 16.0471, longitude: 108.2068 }
    },
    {
      street: '222 Beach Road',
      ward: 'My An',
      district: 'Ngu Hanh Son District',
      city: 'Da Nang', 
      province: 'Da Nang',
      coordinates: { latitude: 16.0137, longitude: 108.2520 }
    },
    
    // Can Tho addresses
    {
      street: '333 Mekong Delta',
      ward: 'Tan An',
      district: 'Ninh Kieu District',
      city: 'Can Tho',
      province: 'Can Tho',
      coordinates: { latitude: 10.0452, longitude: 105.7469 }
    },
    {
      street: '444 Floating Market',
      ward: 'Cai Khe',
      district: 'Ninh Kieu District',
      city: 'Can Tho',
      province: 'Can Tho', 
      coordinates: { latitude: 10.0302, longitude: 105.7831 }
    }
  ];

  // Get address from coordinates using reverse geocoding
  static async reverseGeocode(latitude: number, longitude: number): Promise<GeocodeResult> {
    try {
      // Try OpenStreetMap Nominatim API first
      const response = await fetch(
        `${this.NOMINATIM_API}/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=vi,en`,
        {
          headers: {
            'User-Agent': 'LongChau-PMS/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const address = this.parseNominatimAddress(data, latitude, longitude);
          return { success: true, address };
        }
      }
    } catch (error) {
      console.warn('Nominatim API failed, using fallback:', error);
    }

    // Fallback: Find nearest address from our Vietnam database
    const fallbackAddress = this.findNearestAddress(latitude, longitude);
    return { success: true, address: fallbackAddress };
  }

  // Get coordinates from address using forward geocoding
  static async geocode(address: string): Promise<GeocodeResult> {
    try {
      // Try OpenStreetMap Nominatim API first
      const response = await fetch(
        `${this.NOMINATIM_API}/search?format=json&q=${encodeURIComponent(address)}, Vietnam&addressdetails=1&limit=1&accept-language=vi,en`,
        {
          headers: {
            'User-Agent': 'LongChau-PMS/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          const result = data[0];
          const latitude = parseFloat(result.lat);
          const longitude = parseFloat(result.lon);
          const addressObj = this.parseNominatimAddress(result, latitude, longitude);
          return { success: true, address: addressObj };
        }
      }
    } catch (error) {
      console.warn('Nominatim geocoding failed, using fallback:', error);
    }

    // Fallback: Search our Vietnam address database
    const fallbackAddress = this.searchAddressDatabase(address);
    if (fallbackAddress) {
      return { success: true, address: fallbackAddress };
    }

    return { success: false, error: 'Address not found' };
  }

  // Parse Nominatim API response
  private static parseNominatimAddress(data: any, lat: number, lng: number): Address {
    const addr = data.address || {};
    
    return {
      street: addr.house_number && addr.road ? `${addr.house_number} ${addr.road}` : (addr.road || 'Unknown Street'),
      ward: addr.suburb || addr.neighbourhood || addr.quarter || 'Unknown Ward',
      district: addr.city_district || addr.county || addr.state_district || 'Unknown District',
      city: addr.city || addr.town || addr.village || 'Unknown City',
      province: addr.state || addr.province || 'Unknown Province',
      fullAddress: data.display_name || 'Unknown Address',
      coordinates: { latitude: lat, longitude: lng }
    };
  }

  // Find nearest address from our database
  private static findNearestAddress(latitude: number, longitude: number): Address {
    let nearest = this.VIETNAM_ADDRESSES[0];
    let minDistance = this.calculateDistance(latitude, longitude, nearest.coordinates.latitude, nearest.coordinates.longitude);

    for (const addr of this.VIETNAM_ADDRESSES) {
      const distance = this.calculateDistance(latitude, longitude, addr.coordinates.latitude, addr.coordinates.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = addr;
      }
    }

    return {
      ...nearest,
      fullAddress: `${nearest.street}, ${nearest.ward}, ${nearest.district}, ${nearest.city}, ${nearest.province}`
    };
  }

  // Search address database by text
  private static searchAddressDatabase(searchText: string): Address | null {
    const search = searchText.toLowerCase();
    
    for (const addr of this.VIETNAM_ADDRESSES) {
      const fullAddr = `${addr.street} ${addr.ward} ${addr.district} ${addr.city} ${addr.province}`.toLowerCase();
      if (fullAddr.includes(search) || search.includes(addr.city.toLowerCase())) {
        return {
          ...addr,
          fullAddress: `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}, ${addr.province}`
        };
      }
    }

    return null;
  }

  // Calculate distance between two coordinates (Haversine formula)
  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  // Get random Vietnamese address (for demo/testing)
  static getRandomVietnameseAddress(): Address {
    const randomIndex = Math.floor(Math.random() * this.VIETNAM_ADDRESSES.length);
    const addr = this.VIETNAM_ADDRESSES[randomIndex];
    return {
      ...addr,
      fullAddress: `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}, ${addr.province}`
    };
  }

  // Get addresses by city
  static getAddressesByCity(cityName: string): Address[] {
    return this.VIETNAM_ADDRESSES
      .filter(addr => addr.city.toLowerCase().includes(cityName.toLowerCase()))
      .map(addr => ({
        ...addr,
        fullAddress: `${addr.street}, ${addr.ward}, ${addr.district}, ${addr.city}, ${addr.province}`
      }));
  }

  // Validate Vietnamese phone number
  static validateVietnamesePhone(phone: string): boolean {
    // Vietnamese phone number patterns
    const patterns = [
      /^(\+84|84|0)(3|5|7|8|9)([0-9]{8})$/, // Mobile
      /^(\+84|84|0)(2)([0-9]{9})$/ // Landline
    ];
    
    return patterns.some(pattern => pattern.test(phone.replace(/\s+/g, '')));
  }

  // Format Vietnamese address for display
  static formatAddress(address: Address): string {
    return `${address.street}, ${address.ward}, ${address.district}, ${address.city}`;
  }
}
