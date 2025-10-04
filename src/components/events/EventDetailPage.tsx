import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Calendar, MapPin, Users, Clock, Star, Share2, Download,
  ExternalLink, Timer, Loader2, CheckCircle, AlertCircle, Play,
  User, Award, Globe, Mail, Phone, Ticket
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/NewAuthContext';
// UPDATED: Import OrganizerEvent and OrganizerTicketType instead of EventDetail
import { organizerCrudService, OrganizerEvent, OrganizerTicketType } from '../../services/organizerCrudService';
import { attendeeEventService } from '../../services/attendeeEventService';

// Tier colors for sponsor badges
const tierColors = {
  platinum: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  silver: 'from-gray-300 to-gray-500',
  bronze: 'from-orange-400 to-orange-600'
};

// ADDED: A mock speaker/sponsor type to avoid breaking the existing UI
interface MockSponsor {
    id: string;
    name: string;
    logo: string;
    tier: 'platinum' | 'gold' | 'silver' | 'bronze';
    website: string;
}
interface MockSpeaker {
    id: string;
    name: string;
    title: string;
    company: string;
    image: string;
    bio: string;
    sessions: string[];
}
interface MockScheduleItem {
    id: string;
    time: string;
    title: string;
    description: string;
    speaker?: string;
    room: string;
    type: 'keynote' | 'session' | 'workshop' | 'break' | 'networking';
}


const EventDetailPage: React.FC = () => {
  const { setBreadcrumbs } = useApp();
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { setRegistrationData } = useApp();
  // UPDATED: State now uses the OrganizerEvent type from your service
  const [event, setEvent] = useState<OrganizerEvent | null>(null);
  // ADDED: State to hold the ticket types for the event
  const [ticketTypes, setTicketTypes] = useState<OrganizerTicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  // UPDATED: This now holds the ID of the selected ticket, not a string literal
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');

  // --- MOCK DATA FOR UI COMPATIBILITY ---
  // These are placeholders because the `organizerCrudService` doesn't provide them yet.
  // In a real application, you would fetch this data as well.
  const mockSpeakers: MockSpeaker[] = [
      { id: 'speaker-1', name: 'John Doe', title: 'Keynote Speaker', company: 'Tech Corp', image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg', bio: 'Industry expert with 10+ years experience', sessions: ['Opening Keynote'] }
  ];
  const mockSponsors: MockSponsor[] = [
      { id: 'sponsor-1', name: 'Tech Sponsor', logo: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg', tier: 'gold', website: 'https://example.com' }
  ];
    const mockSchedule: MockScheduleItem[] = [
      { id: 'session-1', time: '09:00', title: 'Opening Keynote', speaker: 'John Doe', duration: 60, description: 'Welcome and opening remarks', room: 'Main Hall', type: 'keynote' },
      { id: 'session-2', time: '10:30', title: 'Panel Discussion', speaker: 'Various Speakers', duration: 90, description: 'Industry panel discussion', room: 'Room A', type: 'session' }
  ];


  React.useEffect(() => {
    setBreadcrumbs(['Events', 'Event Details']);
  }, [setBreadcrumbs]);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  useEffect(() => {
    if (event && event.status === 'published') { // UPDATED: Check for 'published' status
      const timer = setInterval(() => {
        const eventDateTime = new Date(`${event.event_date} ${event.time}`).getTime();
        const now = new Date().getTime();
        const difference = eventDateTime - now;

        if (difference > 0) {
          setTimeLeft({
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000)
          });
        } else {
          setTimeLeft(null);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [event]);

  // --- UPDATED `loadEvent` FUNCTION ---
  const loadEvent = async () => {
    if (!eventId) {
      setError('Event ID not provided');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both event details and ticket types from your actual service
      const [eventResult, ticketsResult] = await Promise.all([
        organizerCrudService.getEventById(eventId),
        organizerCrudService.getTicketTypes(eventId)
      ]);

      if (!eventResult.success || !eventResult.event) {
        setError(eventResult.error || 'Event not found');
        return;
      }

      setEvent(eventResult.event);

      if (ticketsResult.success && ticketsResult.tickets) {
        setTicketTypes(ticketsResult.tickets);
        // Set the default selected ticket if available
        if (ticketsResult.tickets.length > 0) {
          setSelectedTicketType(ticketsResult.tickets[0].id);
        }
      }

    } catch (err) {
      setError('Failed to load event details. Please try again.');
      console.error('Error loading event:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || '', // Use description from event
          url: window.location.href,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert('Event URL copied to clipboard!');
    }).catch(() => {
      alert('Failed to copy URL. Please copy manually from the address bar.');
    });
  };

  const handleDownloadSchedule = () => {
    // In a real app, this would generate and download a PDF
    alert('Schedule PDF download would start here');
  };

  const handleRegister = () => {
    if (!isAuthenticated) {
      alert('Please log in to register for this event');
      return;
    }
    
    if (event) {
      const selectedTicket = ticketTypes.find(t => t.id === selectedTicketType);
        if (!selectedTicket) {
            alert("Please select a valid ticket type.");
            return;
        }
      
      // Prepare registration data
      const registrationInfo = {
        eventId: event.id,
        eventDetails: {
          title: event.title,
          description: event.description,
          date: event.event_date,
          time: event.time,
          location: event.venue,
          image: event.image_url,
          category: event.category
        },
        ticketType: selectedTicket.name,
        price: selectedTicket.price
      };
      
      setRegistrationData(registrationInfo);
      navigate('/event-payment');
    }
  };

  const getTicketPrice = () => {
    if (!event || !selectedTicketType) return 0;
    const ticket = ticketTypes.find(t => t.id === selectedTicketType);
    return ticket ? ticket.price : 0;
  };

  const getAvailabilityStatus = () => {
    if (!event) return 'unknown';
    const spotsLeft = event.capacity - (event.attendees || 0); // Use attendees from event
    if (spotsLeft <= 0) return 'sold-out';
    if (spotsLeft <= 50) return 'limited';
    return 'available';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading event details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-red-700 mb-4">{error || 'Event not found'}</p>
              <button
                onClick={() => window.history.back()}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const availabilityStatus = getAvailabilityStatus();

  // Calculate attendees and spots left using real data
  const currentAttendees = event.attendees || 0;
  const maxAttendees = event.capacity;
  const spotsRemaining = maxAttendees - currentAttendees;

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sticky Register Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleRegister}
          disabled={availabilityStatus === 'sold-out'}
          className={`px-6 py-3 rounded-full font-medium shadow-lg transition-all duration-200 transform hover:scale-105 ${
            availabilityStatus === 'sold-out'
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl'
          }`}
        >
          {availabilityStatus === 'sold-out' ? 'Sold Out' : `Register Now - $${getTicketPrice()}`}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/discover')}
          className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Header */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={event.image_url} // UPDATED
                  alt={event.title}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute top-4 left-4 flex space-x-2">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {event.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleShare}
                    className="bg-white/90 backdrop-blur-sm text-gray-900 p-2 rounded-full hover:bg-white transition-colors duration-200"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{event.title}</h1>
                <p className="text-xl text-gray-600 mb-6">{event.description}</p>

                {/* Event Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(event.event_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-sm text-gray-600">{event.time} - {event.end_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-gray-900">{event.venue}</p>
                      {/* Address would need to be added to your event table */}
                      <p className="text-sm text-gray-600">Live Location</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {currentAttendees} / {maxAttendees} Attendees
                      </p>
                      <p className="text-sm text-gray-600">
                        {spotsRemaining} spots remaining
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Full Day Event</p>
                      <p className="text-sm text-gray-600">9 hours of content</p>
                    </div>
                  </div>
                </div>

                {/* Availability Status */}
                <div className={`p-4 rounded-lg mb-6 ${
                  availabilityStatus === 'sold-out' 
                    ? 'bg-red-50 border border-red-200' 
                    : availabilityStatus === 'limited'
                    ? 'bg-orange-50 border border-orange-200'
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {availabilityStatus === 'sold-out' ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : availabilityStatus === 'limited' ? (
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    <p className={`font-medium ${
                      availabilityStatus === 'sold-out' 
                        ? 'text-red-800' 
                        : availabilityStatus === 'limited'
                        ? 'text-orange-800'
                        : 'text-green-800'
                    }`}>
                      {availabilityStatus === 'sold-out' 
                        ? 'Event is sold out' 
                        : availabilityStatus === 'limited'
                        ? `Only ${spotsRemaining} spots left!`
                        : 'Tickets available'
                      }
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Registration Progress</span>
                    <span>{Math.round((currentAttendees / maxAttendees) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        availabilityStatus === 'sold-out'
                          ? 'bg-red-500'
                          : availabilityStatus === 'limited'
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((currentAttendees / maxAttendees) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Full Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">About This Event</h2>
              <div className="prose prose-lg max-w-none">
                 {(event.description || '').split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

            </div>
            
            {/* Schedule, Speakers, Sponsors would be populated similarly if data was available */}
            {/* Schedule */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Schedule</h2>
                 {/* ... Schedule items would be mapped here from real data */}
                 <div className="text-center py-8 text-gray-500">
                    <p>Schedule information will be available soon.</p>
                  </div>
            </div>

            {/* Speakers */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Speakers</h2>
                 {/* ... Speakers would be mapped here from real data */}
                <div className="text-center py-8 text-gray-500">
                    <p>Speaker information will be available soon.</p>
                </div>
            </div>
            
             {/* Sponsors */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Sponsors</h2>
                 {/* ... Sponsors would be mapped here from real data */}
                <div className="text-center py-8 text-gray-500">
                    <p>Sponsor information will be available soon.</p>
                </div>
            </div>


            {/* Organizer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Organizer</h2>
               {/* ... Organizer info would be populated here */}
               <div className="text-center py-8 text-gray-500">
                    <p>Organizer information will be available soon.</p>
                </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Countdown Timer */}
            {timeLeft && event.status === 'published' && (
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                {/* ... countdown timer UI ... */}
              </div>
            )}

            {/* Ticket Pricing */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Options</h3>
              <div className="space-y-3">
                 {ticketTypes.map((ticket) => (
                  <label
                    key={ticket.id}
                    className={`flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedTicketType === ticket.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="ticketType"
                        value={ticket.id}
                        checked={selectedTicketType === ticket.id}
                        onChange={(e) => setSelectedTicketType(e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <p className="font-medium text-gray-900 capitalize">{ticket.name}</p>
                        <p className="text-xs text-gray-500">{ticket.description}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">${ticket.price}</span>
                  </label>
                ))}
                 {ticketTypes.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                        <p>Ticketing information will be available soon.</p>
                    </div>
                 )}
              </div>

              <button
                onClick={handleRegister}
                disabled={availabilityStatus === 'sold-out' || ticketTypes.length === 0}
                className={`w-full mt-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
                  availabilityStatus === 'sold-out' || ticketTypes.length === 0
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                }`}
              >
                {availabilityStatus === 'sold-out' 
                  ? 'Sold Out' 
                  : `Register Now - $${getTicketPrice()}`
                }
              </button>

              {!isAuthenticated && availabilityStatus !== 'sold-out' && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Please log in to register for this event
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share Event</span>
                </button>
                <button
                  onClick={handleDownloadSchedule}
                  className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Schedule</span>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
