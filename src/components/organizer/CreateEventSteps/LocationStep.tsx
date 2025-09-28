import React from 'react';
import { EventFormData, EventValidationErrors } from '../../../types/eventManagement';

interface LocationStepProps {
  formData: EventFormData;
  onChange: (parentField: string, childField: string, value: any) => void;
  errors: EventValidationErrors;
}

const LocationStep: React.FC<LocationStepProps> = ({ formData, onChange, errors }) => {
  const venueTypes = [
    { value: 'physical', label: 'Physical Venue' },
    { value: 'virtual', label: 'Virtual Event' },
    { value: 'hybrid', label: 'Hybrid Event' }
  ];

  const commonAmenities = [
    'WiFi',
    'Parking',
    'Catering',
    'Audio/Visual Equipment',
    'Accessibility Features',
    'Air Conditioning',
    'Restrooms',
    'Seating',
    'Stage',
    'Projector',
    'Microphone',
    'Whiteboard'
  ];

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = formData.venue.amenities;
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    onChange('venue', 'amenities', updatedAmenities);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location & Venue</h3>
        
        {/* Venue Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Event Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {venueTypes.map((type) => (
              <label
                key={type.value}
                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.venue.type === type.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="venueType"
                  value={type.value}
                  checked={formData.venue.type === type.value}
                  onChange={(e) => onChange('venue', 'type', e.target.value)}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    formData.venue.type === type.value
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.venue.type === type.value && (
                      <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{type.label}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Physical Venue Details */}
        {formData.venue.type === 'physical' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue Name *
              </label>
              <input
                type="text"
                value={formData.venue.name}
                onChange={(e) => onChange('venue', 'name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.venue ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter venue name"
              />
              {errors.venue && <p className="mt-1 text-sm text-red-600">{errors.venue}</p>}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={formData.venue.address}
                onChange={(e) => onChange('venue', 'address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter full address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.venue.city}
                  onChange={(e) => onChange('venue', 'city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  value={formData.venue.state}
                  onChange={(e) => onChange('venue', 'state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="State/Province"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  value={formData.venue.zipCode}
                  onChange={(e) => onChange('venue', 'zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ZIP/Postal Code"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                value={formData.venue.country}
                onChange={(e) => onChange('venue', 'country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="CN">China</option>
                <option value="IN">India</option>
                <option value="BR">Brazil</option>
                <option value="MX">Mexico</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>
        )}

        {/* Virtual Event Details */}
        {formData.venue.type === 'virtual' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Virtual Event Link
            </label>
            <input
              type="url"
              value={formData.venue.virtualLink || ''}
              onChange={(e) => onChange('venue', 'virtualLink', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the meeting link for your virtual event
            </p>
          </div>
        )}

        {/* Hybrid Event Details */}
        {formData.venue.type === 'hybrid' && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physical Venue Name *
              </label>
              <input
                type="text"
                value={formData.venue.name}
                onChange={(e) => onChange('venue', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter venue name"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Physical Address *
              </label>
              <input
                type="text"
                value={formData.venue.address}
                onChange={(e) => onChange('venue', 'address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter full address"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Virtual Event Link
              </label>
              <input
                type="url"
                value={formData.venue.virtualLink || ''}
                onChange={(e) => onChange('venue', 'virtualLink', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="https://zoom.us/j/123456789"
              />
            </div>
          </>
        )}

        {/* Capacity */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Capacity *
          </label>
          <input
            type="number"
            min="1"
            value={formData.venue.capacity}
            onChange={(e) => onChange('venue', 'capacity', parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="100"
          />
          <p className="mt-1 text-sm text-gray-500">
            Maximum number of attendees for this event
          </p>
        </div>

        {/* Amenities */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Venue Amenities
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {commonAmenities.map((amenity) => (
              <label
                key={amenity}
                className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={formData.venue.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-3 text-sm text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Coordinates (Optional) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coordinates (Optional)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={formData.venue.coordinates?.lat || ''}
                onChange={(e) => onChange('venue', 'coordinates', {
                  ...formData.venue.coordinates,
                  lat: parseFloat(e.target.value) || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="40.7128"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={formData.venue.coordinates?.lng || ''}
                onChange={(e) => onChange('venue', 'coordinates', {
                  ...formData.venue.coordinates,
                  lng: parseFloat(e.target.value) || undefined
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="-74.0060"
              />
            </div>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Optional: Add precise coordinates for better location accuracy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationStep;

