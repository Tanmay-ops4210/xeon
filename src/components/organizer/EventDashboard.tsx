import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/NewAuthContext';
import { Event, EventListResponse, EventFilters } from '../../types/eventManagement';
import { eventService } from '../../services/eventManagementService';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface EventDashboardProps {
  onCreateEvent?: () => void;
  onEditEvent?: (eventId: string) => void;
}

const EventDashboard: React.FC<EventDashboardProps> = ({ onCreateEvent, onEditEvent }) => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EventFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      loadEvents();
    }
  }, [profile?.id, filters]);

  const loadEvents = async () => {
    if (!profile?.id) return;
    
    setLoading(true);
    try {
      const response = await eventService.getEventsByOrganizer(profile.id, filters);
      setEvents(response.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!profile?.id) return;
    
    try {
      const result = await eventService.deleteEvent(eventId, profile.id);
      if (result.success) {
        setEvents(events.filter(event => event.id !== eventId));
        setShowDeleteModal(false);
        setSelectedEvent(null);
      } else {
        console.error('Failed to delete event:', result.error);
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const handlePublishEvent = async (eventId: string) => {
    if (!profile?.id) return;
    
    try {
      const result = await eventService.publishEvent(eventId, profile.id);
      if (result.success) {
        setEvents(events.map(event => 
          event.id === eventId ? { ...event, status: 'published' } : event
        ));
      } else {
        console.error('Failed to publish event:', result.error);
      }
    } catch (error) {
      console.error('Failed to publish event:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'draft':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600">Manage your events and track their performance</p>
        </div>
        <button
          onClick={onCreateEvent}
          className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => setFilters({ ...filters, category: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Arts & Culture">Arts & Culture</option>
                <option value="Sports & Fitness">Sports & Fitness</option>
                <option value="Food & Drink">Food & Drink</option>
                <option value="Travel & Tourism">Travel & Tourism</option>
                <option value="Science">Science</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type</label>
              <select
                value={filters.location?.type || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  location: { ...filters.location, type: e.target.value as any || undefined }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Types</option>
                <option value="physical">Physical</option>
                <option value="virtual">Virtual</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || Object.keys(filters).length > 0 
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first event'
            }
          </p>
          {!searchQuery && Object.keys(filters).length === 0 && (
            <button
              onClick={onCreateEvent}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Event Image */}
              <div className="h-48 bg-gray-200 relative">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {getStatusIcon(event.status)}
                    <span className="ml-1 capitalize">{event.status}</span>
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{formatDate(event.startDate)} at {formatTime(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="truncate">
                      {event.venue.type === 'virtual' ? 'Virtual Event' : event.venue.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{event.currentAttendees} / {event.maxAttendees} attendees</span>
                  </div>
                  
                  {event.ticketTypes.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>
                        {event.ticketTypes.length === 1 
                          ? `From ${event.ticketTypes[0].price} ${event.currency}`
                          : `${event.ticketTypes.length} ticket types`
                        }
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEditEvent?.(event.id)}
                      className="flex items-center px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    
                    {event.status === 'draft' && (
                      <button
                        onClick={() => handlePublishEvent(event.id)}
                        className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-800"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Publish
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Event</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedEvent.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteEvent(selectedEvent.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Actions Dropdown */}
      {selectedEvent && !showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Event Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  onEditEvent?.(selectedEvent.id);
                  setSelectedEvent(null);
                }}
                className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-md"
              >
                <Edit className="w-4 h-4 mr-3" />
                Edit Event
              </button>
              
              {selectedEvent.status === 'draft' && (
                <button
                  onClick={() => {
                    handlePublishEvent(selectedEvent.id);
                    setSelectedEvent(null);
                  }}
                  className="w-full flex items-center px-4 py-2 text-left text-green-700 hover:bg-green-50 rounded-md"
                >
                  <Eye className="w-4 h-4 mr-3" />
                  Publish Event
                </button>
              )}
              
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                  setSelectedEvent(null);
                }}
                className="w-full flex items-center px-4 py-2 text-left text-red-700 hover:bg-red-50 rounded-md"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Delete Event
              </button>
            </div>
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDashboard;

