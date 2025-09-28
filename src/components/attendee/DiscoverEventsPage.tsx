import React, { useState, useEffect } from 'react';
import { Event, EventListResponse, EventSearchParams } from '../../types/eventManagement';
import { eventService } from '../../services/eventManagementService';
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Search, 
  Filter,
  Clock,
  Star,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const DiscoverEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState<EventSearchParams>({
    query: '',
    filters: {},
    sortBy: 'start_date',
    sortOrder: 'asc',
    page: 1,
    limit: 12
  });
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadEvents();
  }, [searchParams]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const response = await eventService.getPublishedEvents(searchParams);
      setEvents(response.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchParams(prev => ({
      ...prev,
      query,
      page: 1
    }));
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    setSearchParams(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterKey]: value
      },
      page: 1
    }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSearchParams(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      page: 1
    }));
  };

  const toggleFavorite = (eventId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(eventId)) {
        newFavorites.delete(eventId);
      } else {
        newFavorites.add(eventId);
      }
      return newFavorites;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
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

  const getTimeUntilEvent = (dateString: string) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffTime = eventDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
    return `${Math.ceil(diffDays / 30)} months`;
  };

  const getPriceRange = (ticketTypes: any[]) => {
    if (ticketTypes.length === 0) return 'Free';
    
    const prices = ticketTypes.map(t => t.price).filter(p => p > 0);
    if (prices.length === 0) return 'Free';
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) return `$${min}`;
    return `$${min} - $${max}`;
  };

  const categories = [
    'All Categories',
    'Technology',
    'Business',
    'Education',
    'Health & Wellness',
    'Arts & Culture',
    'Sports & Fitness',
    'Food & Drink',
    'Travel & Tourism',
    'Science',
    'Entertainment'
  ];

  const sortOptions = [
    { value: 'start_date', label: 'Date', order: 'asc' },
    { value: 'start_date', label: 'Date (Newest)', order: 'desc' },
    { value: 'title', label: 'Name (A-Z)', order: 'asc' },
    { value: 'title', label: 'Name (Z-A)', order: 'desc' },
    { value: 'created_at', label: 'Recently Added', order: 'desc' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Events</h1>
        <p className="text-gray-600">Find amazing events happening near you and around the world</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events, speakers, or topics..."
              value={searchParams.query || ''}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={`${searchParams.sortBy}_${searchParams.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_');
                handleSortChange(sortBy, sortOrder as 'asc' | 'desc');
              }}
              className="appearance-none px-6 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {sortOptions.map((option, index) => (
                <option key={index} value={`${option.value}_${option.order}`}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={searchParams.filters?.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category === 'All Categories' ? '' : category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                <select
                  value={searchParams.filters?.dateRange ? 'custom' : ''}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      // Handle custom date range
                    } else {
                      handleFilterChange('dateRange', undefined);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any time</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this_week">This week</option>
                  <option value="this_month">This month</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>

              {/* Location Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                <select
                  value={searchParams.filters?.location?.type || ''}
                  onChange={(e) => handleFilterChange('location', {
                    ...searchParams.filters?.location,
                    type: e.target.value || undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All types</option>
                  <option value="physical">In-person</option>
                  <option value="virtual">Virtual</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <select
                  value={searchParams.filters?.priceRange ? 'custom' : ''}
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      // Handle custom price range
                    } else {
                      handleFilterChange('priceRange', undefined);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any price</option>
                  <option value="free">Free</option>
                  <option value="under_25">Under $25</option>
                  <option value="25_50">$25 - $50</option>
                  <option value="50_100">$50 - $100</option>
                  <option value="over_100">Over $100</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">
            Try adjusting your search criteria or check back later for new events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group">
              {/* Event Image */}
              <div className="h-48 bg-gray-200 relative overflow-hidden">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(event.id)}
                  className="absolute top-3 right-3 p-2 bg-white bg-opacity-80 rounded-full hover:bg-opacity-100 transition-all"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      favorites.has(event.id) 
                        ? 'text-red-500 fill-current' 
                        : 'text-gray-600'
                    }`} 
                  />
                </button>

                {/* Time Badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2 py-1 bg-black bg-opacity-60 text-white text-xs font-medium rounded">
                    <Clock className="w-3 h-3 mr-1" />
                    {getTimeUntilEvent(event.startDate)}
                  </span>
                </div>

                {/* Category Badge */}
                <div className="absolute bottom-3 left-3">
                  <span className="inline-flex items-center px-2 py-1 bg-indigo-600 text-white text-xs font-medium rounded">
                    {event.category}
                  </span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                  {event.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {event.description}
                </p>

                {/* Event Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{formatDate(event.startDate)} at {formatTime(event.startDate)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {event.venue.type === 'virtual' ? 'Virtual Event' : event.venue.name}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{event.currentAttendees} attending</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{getPriceRange(event.ticketTypes)}</span>
                  </div>
                </div>

                {/* Organizer */}
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-3">
                    {event.organizer.avatar ? (
                      <img
                        src={event.organizer.avatar}
                        alt={event.organizer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{event.organizer.name}</p>
                    <p className="text-xs text-gray-500">Organizer</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <button className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium">
                    View Details
                  </button>
                  
                  <div className="flex space-x-2 ml-3">
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More Button */}
      {events.length > 0 && (
        <div className="text-center mt-8">
          <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Load More Events
          </button>
        </div>
      )}
    </div>
  );
};

export default DiscoverEventsPage;

