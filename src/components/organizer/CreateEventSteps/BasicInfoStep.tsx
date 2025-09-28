import React from 'react';
import { EventFormData, EventValidationErrors } from '../../../types/eventManagement';

interface BasicInfoStepProps {
  formData: EventFormData;
  onChange: (field: string, value: any) => void;
  errors: EventValidationErrors;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, onChange, errors }) => {
  const categories = [
    'Technology',
    'Business',
    'Education',
    'Health & Wellness',
    'Arts & Culture',
    'Sports & Fitness',
    'Food & Drink',
    'Travel & Tourism',
    'Science',
    'Entertainment',
    'Other'
  ];

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      onChange('tags', [...formData.tags, tag.trim()]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    onChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        
        {/* Event Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Event Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => onChange('title', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your event title"
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Event Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Short Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Brief description of your event"
          />
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Full Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Description
          </label>
          <textarea
            value={formData.fullDescription}
            onChange={(e) => onChange('fullDescription', e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Detailed description of your event"
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => onChange('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add a tag and press Enter"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTagAdd(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => onChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.startDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => onChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.endDate ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
          </div>
        </div>

        {/* Timezone */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => onChange('timezone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
            <option value="Asia/Shanghai">Shanghai (CST)</option>
            <option value="Australia/Sydney">Sydney (AEST)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;

