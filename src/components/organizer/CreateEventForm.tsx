import React, { useState, useCallback } from 'react';
import { useAuth } from '../../contexts/NewAuthContext';
import { EventFormData, EventValidationErrors } from '../../types/eventManagement';
import { eventService } from '../../services/eventManagementService';
import { storageService } from '../../services/storageService';
import { Calendar, MapPin, Users, DollarSign, Image, Upload, X, Plus, Save, Eye } from 'lucide-react';

interface CreateEventFormProps {
  onSuccess?: (eventId: string) => void;
  onCancel?: () => void;
}

const CreateEventForm: React.FC<CreateEventFormProps> = ({ onSuccess, onCancel }) => {
  const { profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<EventValidationErrors>({});
  
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    fullDescription: '',
    category: '',
    tags: [],
    startDate: '',
    endDate: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    venue: {
      name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      capacity: 100,
      type: 'physical',
      amenities: [],
      coordinates: undefined,
      virtualLink: ''
    },
    image: null,
    gallery: [],
    ticketTypes: [],
    currency: 'USD',
    maxAttendees: 100,
    registrationDeadline: '',
    requireApproval: false,
    allowWaitlist: true,
    maxTicketsPerPerson: 5,
    whatToExpect: [],
    requirements: [],
    refundPolicy: '',
    organizer: {
      name: profile?.name || '',
      bio: '',
      contact: profile?.email || '',
      avatar: null
    },
    speakers: [],
    schedule: [],
    visibility: 'public',
    status: 'draft'
  });

  const steps = [
    { id: 1, title: 'Basic Info', icon: Calendar },
    { id: 2, title: 'Location', icon: MapPin },
    { id: 3, title: 'Tickets', icon: DollarSign },
    { id: 4, title: 'Speakers', icon: Users },
    { id: 5, title: 'Schedule', icon: Calendar },
    { id: 6, title: 'Media', icon: Image },
    { id: 7, title: 'Review', icon: Eye }
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[field as keyof EventValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleNestedInputChange = (parentField: string, childField: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof EventFormData],
        [childField]: value
      }
    }));
  };

  const handleImageUpload = async (file: File, type: 'image' | 'gallery' | 'organizer' | 'speaker') => {
    try {
      let result;
      
      switch (type) {
        case 'image':
          result = await storageService.uploadEventImage(file);
          if (result.success) {
            handleInputChange('image', result.url);
          }
          break;
        case 'gallery':
          result = await storageService.uploadEventImage(file);
          if (result.success) {
            handleInputChange('gallery', [...formData.gallery, result.url]);
          }
          break;
        case 'organizer':
          if (profile?.id) {
            result = await storageService.uploadOrganizerAvatar(file, profile.id);
            if (result.success) {
              handleNestedInputChange('organizer', 'avatar', result.url);
            }
          }
          break;
      }
    } catch (error) {
      console.error('Image upload error:', error);
    }
  };

  const validateForm = (): boolean => {
    const errors: EventValidationErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Event description is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      errors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.endDate = 'End date must be after start date';
    }

    if (!formData.venue.name.trim()) {
      errors.venue = 'Venue name is required';
    }

    if (formData.ticketTypes.length === 0) {
      errors.ticketTypes = 'At least one ticket type is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !profile?.id) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await eventService.createEvent(formData, profile.id);
      
      if (result.success && result.event) {
        onSuccess?.(result.event.id);
      } else {
        console.error('Event creation failed:', result.error);
        setValidationErrors({ general: result.error || 'Failed to create event' });
      }
    } catch (error) {
      console.error('Event creation error:', error);
      setValidationErrors({ general: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep formData={formData} onChange={handleInputChange} errors={validationErrors} />;
      case 2:
        return <LocationStep formData={formData} onChange={handleNestedInputChange} errors={validationErrors} />;
      case 3:
        return <TicketsStep formData={formData} onChange={handleInputChange} errors={validationErrors} />;
      case 4:
        return <SpeakersStep formData={formData} onChange={handleInputChange} onImageUpload={handleImageUpload} errors={validationErrors} />;
      case 5:
        return <ScheduleStep formData={formData} onChange={handleInputChange} errors={validationErrors} />;
      case 6:
        return <MediaStep formData={formData} onChange={handleInputChange} onImageUpload={handleImageUpload} errors={validationErrors} />;
      case 7:
        return <ReviewStep formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 
                    isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                    'bg-white border-gray-300 text-gray-500'}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {renderStepContent()}
        
        {/* Error Display */}
        {validationErrors.general && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{validationErrors.general}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={currentStep === 1 ? onCancel : prevStep}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>
          
          <div className="flex space-x-3">
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleInputChange('status', 'draft')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEventForm;

