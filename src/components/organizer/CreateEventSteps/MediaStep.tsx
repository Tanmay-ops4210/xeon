import React from 'react';
import { EventFormData, EventValidationErrors } from '../../../types/eventManagement';
import { Upload, Image, X, Plus } from 'lucide-react';

interface MediaStepProps {
  formData: EventFormData;
  onChange: (field: string, value: any) => void;
  onImageUpload: (file: File, type: 'image' | 'gallery' | 'organizer') => void;
  errors: EventValidationErrors;
}

const MediaStep: React.FC<MediaStepProps> = ({ formData, onChange, onImageUpload, errors }) => {
  const handleImageUpload = (file: File, type: 'image' | 'gallery' | 'organizer') => {
    onImageUpload(file, type);
    
    if (type === 'image') {
      onChange('image', file);
    } else if (type === 'gallery') {
      onChange('gallery', [...formData.gallery, file]);
    } else if (type === 'organizer') {
      onChange('organizer', { ...formData.organizer, avatar: file });
    }
  };

  const removeGalleryImage = (index: number) => {
    const updatedGallery = formData.gallery.filter((_, i) => i !== index);
    onChange('gallery', updatedGallery);
  };

  const addWhatToExpect = () => {
    const item = prompt('What should attendees expect?');
    if (item?.trim()) {
      onChange('whatToExpect', [...formData.whatToExpect, item.trim()]);
    }
  };

  const removeWhatToExpect = (index: number) => {
    const updated = formData.whatToExpect.filter((_, i) => i !== index);
    onChange('whatToExpect', updated);
  };

  const addRequirement = () => {
    const item = prompt('What are the requirements?');
    if (item?.trim()) {
      onChange('requirements', [...formData.requirements, item.trim()]);
    }
  };

  const removeRequirement = (index: number) => {
    const updated = formData.requirements.filter((_, i) => i !== index);
    onChange('requirements', updated);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Media & Content</h3>
        
        {/* Event Image */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Event Image *
          </label>
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {formData.image ? (
                <img
                  src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)}
                  alt="Event"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, 'image');
                  }
                }}
                className="hidden"
                id="event-image"
              />
              <label
                htmlFor="event-image"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Event Image
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Recommended: 1200x630px, JPG or PNG
              </p>
            </div>
          </div>
        </div>

        {/* Event Gallery */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Event Gallery
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {formData.gallery.map((image, index) => (
              <div key={index} className="relative group">
                <div className="w-full h-24 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeGalleryImage(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {formData.gallery.length < 8 && (
              <div className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file, 'gallery');
                    }
                  }}
                  className="hidden"
                  id="gallery-upload"
                />
                <label
                  htmlFor="gallery-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Plus className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Add Image</span>
                </label>
              </div>
            )}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Add up to 8 images to showcase your event
          </p>
        </div>

        {/* Organizer Avatar */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Organizer Avatar
          </label>
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {formData.organizer.avatar ? (
                <img
                  src={typeof formData.organizer.avatar === 'string' ? formData.organizer.avatar : URL.createObjectURL(formData.organizer.avatar)}
                  alt="Organizer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, 'organizer');
                  }
                }}
                className="hidden"
                id="organizer-avatar"
              />
              <label
                htmlFor="organizer-avatar"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Avatar
              </label>
              <p className="mt-2 text-xs text-gray-500">
                Recommended: 200x200px, JPG or PNG
              </p>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              What to Expect
            </label>
            <button
              type="button"
              onClick={addWhatToExpect}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add Item
            </button>
          </div>
          <div className="space-y-2">
            {formData.whatToExpect.map((item, index) => (
              <div key={index} className="flex items-center">
                <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {item}
                </span>
                <button
                  type="button"
                  onClick={() => removeWhatToExpect(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {formData.whatToExpect.length === 0 && (
              <p className="text-sm text-gray-500">No items added yet</p>
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Requirements
            </label>
            <button
              type="button"
              onClick={addRequirement}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add Requirement
            </button>
          </div>
          <div className="space-y-2">
            {formData.requirements.map((item, index) => (
              <div key={index} className="flex items-center">
                <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                  {item}
                </span>
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="ml-2 text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            {formData.requirements.length === 0 && (
              <p className="text-sm text-gray-500">No requirements added yet</p>
            )}
          </div>
        </div>

        {/* Event Settings */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-4">Event Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visibility
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => onChange('visibility', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="public">Public - Anyone can find and view</option>
                <option value="unlisted">Unlisted - Only people with the link can view</option>
                <option value="private">Private - Only invited attendees can view</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => onChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="draft">Draft - Not visible to public</option>
                <option value="published">Published - Visible to public</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaStep;

