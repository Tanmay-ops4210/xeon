import React from 'react';
import { EventFormData } from '../../../types/eventManagement';
import { Calendar, MapPin, Users, DollarSign, Clock, Image, Globe, Lock } from 'lucide-react';

interface ReviewStepProps {
  formData: EventFormData;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ formData }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getVenueTypeLabel = (type: string) => {
    switch (type) {
      case 'physical': return 'Physical Venue';
      case 'virtual': return 'Virtual Event';
      case 'hybrid': return 'Hybrid Event';
      default: return type;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Public';
      case 'unlisted': return 'Unlisted';
      case 'private': return 'Private';
      default: return visibility;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'published': return 'Published';
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Review Your Event</h3>
        
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Title</span>
              <p className="text-lg text-gray-900">{formData.title || 'Not set'}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Description</span>
              <p className="text-gray-900">{formData.description || 'Not set'}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Category</span>
              <p className="text-gray-900">{formData.category || 'Not set'}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Tags</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.tags.length > 0 ? (
                  formData.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500">No tags</span>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Start Date & Time</span>
                <p className="text-gray-900">{formatDate(formData.startDate)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">End Date & Time</span>
                <p className="text-gray-900">{formatDate(formData.endDate)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-indigo-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Location</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Event Type</span>
              <p className="text-gray-900">{getVenueTypeLabel(formData.venue.type)}</p>
            </div>
            
            {formData.venue.type !== 'virtual' && (
              <>
                <div>
                  <span className="text-sm font-medium text-gray-500">Venue Name</span>
                  <p className="text-gray-900">{formData.venue.name || 'Not set'}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-500">Address</span>
                  <p className="text-gray-900">
                    {formData.venue.address && formData.venue.city ? (
                      `${formData.venue.address}, ${formData.venue.city}, ${formData.venue.state} ${formData.venue.zipCode}`
                    ) : (
                      'Not set'
                    )}
                  </p>
                </div>
              </>
            )}
            
            {formData.venue.type === 'virtual' && formData.venue.virtualLink && (
              <div>
                <span className="text-sm font-medium text-gray-500">Virtual Link</span>
                <p className="text-gray-900 break-all">{formData.venue.virtualLink}</p>
              </div>
            )}
            
            <div>
              <span className="text-sm font-medium text-gray-500">Capacity</span>
              <p className="text-gray-900">{formData.venue.capacity} attendees</p>
            </div>
            
            {formData.venue.amenities.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500">Amenities</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {formData.venue.amenities.map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tickets */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <DollarSign className="w-5 h-5 text-indigo-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Tickets & Pricing</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Currency</span>
              <p className="text-gray-900">{formData.currency}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Max Attendees</span>
              <p className="text-gray-900">{formData.maxAttendees}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Registration Deadline</span>
              <p className="text-gray-900">{formatDate(formData.registrationDeadline)}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Ticket Types</span>
              {formData.ticketTypes.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {formData.ticketTypes.map((ticket, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{ticket.name}</p>
                          <p className="text-sm text-gray-600">{ticket.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            {formatCurrency(ticket.price, formData.currency)}
                          </p>
                          <p className="text-sm text-gray-600">{ticket.quantity} available</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No ticket types</p>
              )}
            </div>
          </div>
        </div>

        {/* Speakers */}
        {formData.speakers.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-indigo-600 mr-2" />
              <h4 className="text-lg font-medium text-gray-900">Speakers</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.speakers.map((speaker, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {speaker.image ? (
                      <img
                        src={typeof speaker.image === 'string' ? speaker.image : URL.createObjectURL(speaker.image)}
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{speaker.name}</p>
                    <p className="text-sm text-gray-600">{speaker.title}</p>
                    {speaker.company && (
                      <p className="text-sm text-gray-500">{speaker.company}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule */}
        {formData.schedule.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-indigo-600 mr-2" />
              <h4 className="text-lg font-medium text-gray-900">Schedule</h4>
            </div>
            
            <div className="space-y-3">
              {formData.schedule
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.startTime} - {item.endTime}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        {item.room && (
                          <p className="text-sm text-gray-600">{item.room}</p>
                        )}
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                      {item.type}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Media */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <Image className="w-5 h-5 text-indigo-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Media</h4>
          </div>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Event Image</span>
              <div className="mt-2">
                {formData.image ? (
                  <div className="w-32 h-20 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={typeof formData.image === 'string' ? formData.image : URL.createObjectURL(formData.image)}
                      alt="Event"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500">No image uploaded</p>
                )}
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Gallery Images</span>
              <div className="mt-2">
                {formData.gallery.length > 0 ? (
                  <div className="flex space-x-2">
                    {formData.gallery.slice(0, 4).map((image, index) => (
                      <div key={index} className="w-16 h-12 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {formData.gallery.length > 4 && (
                      <div className="w-16 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        <span className="text-xs text-gray-500">+{formData.gallery.length - 4}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No gallery images</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Event Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Globe className="w-5 h-5 text-indigo-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Event Settings</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Visibility</span>
              <div className="flex items-center mt-1">
                {formData.visibility === 'public' ? (
                  <Globe className="w-4 h-4 text-green-600 mr-2" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-600 mr-2" />
                )}
                <p className="text-gray-900">{getVisibilityLabel(formData.visibility)}</p>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-500">Status</span>
              <p className="text-gray-900">{getStatusLabel(formData.status)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;

