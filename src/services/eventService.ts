import { Event } from '../types/event';
import { User } from '../types/user';
import { supabase } from '../lib/supabase';

// Mock user data for plan checking (will be replaced with real auth later)
const mockUser: User = {
    _id: "user123",
    name: "Test User",
    email: "test@example.com",
    plan: "FREE",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

const getPlanConstraints = (plan: "FREE" | "PAID" | "PRO") => {
    switch (plan) {
        case 'FREE':
            return { maxActiveEvents: 1, maxTicketTypes: 2, maxCapacity: 200, allowPaidTickets: false };
        default:
            return { maxActiveEvents: Infinity, maxTicketTypes: Infinity, maxCapacity: Infinity, allowPaidTickets: true };
    }
};

export const eventService = {
  // GET /api/events/mine
  async getMyEvents(): Promise<Event[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('organizer_id', mockUser._id) // Will use real user ID when auth is implemented
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        return [];
      }

      // Transform database events to match Event type
      return data?.map(event => ({
        _id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        category: event.category,
        status: event.status.toUpperCase() as 'DRAFT' | 'PUBLISHED' | 'CANCELLED',
        ownerId: event.organizer_id || '',
        maxAttendees: event.max_attendees,
        price: event.price,
        imageUrl: event.image_url,
        venueName: event.venue_name,
        venueAddress: event.venue_address,
        isOnline: event.is_online,
        onlineLink: event.online_link,
        createdAt: new Date(event.created_at),
        updatedAt: new Date(event.updated_at),
        // Mock data for complex fields that aren't in the database yet
        waterfall: {
          requirements: {
            title: event.title,
            description: event.description,
            startDate: event.start_date,
            endDate: event.end_date,
            location: event.location,
            category: event.category
          },
          implementation: {
            capacity: event.max_attendees || 100,
            pricing: {
              isPaid: event.price > 0,
              amount: event.price
            }
          }
        },
        summary: {
          title: event.title,
          description: event.description,
          startDate: event.start_date,
          endDate: event.end_date,
          location: event.location,
          category: event.category,
          isPaid: event.price > 0,
          price: event.price,
          capacity: event.max_attendees || 100
        },
        planSnapshot: {
          tier: 'FREE' as const,
          constraints: getPlanConstraints('FREE')
        }
      })) || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  // POST /api/events
  async createEvent(eventData: Partial<Event>): Promise<{ ok: boolean, message: string, data?: Event }> {
    try {
      const currentUser = JSON.parse(localStorage.getItem('eventease_user') || '{}');
      const constraints = getPlanConstraints(currentUser.plan || 'FREE');

      // Check if user has reached their event limit
      if (currentUser.plan === 'FREE') {
        const { count } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('organizer_id', currentUser._id)
          .eq('status', 'published');

        if (count && count >= constraints.maxActiveEvents) {
          return { ok: false, message: 'Upgrade your plan to create more events.' };
        }
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title || 'Untitled Event',
          description: eventData.description || '',
          start_date: eventData.startDate || new Date().toISOString(),
          end_date: eventData.endDate || new Date().toISOString(),
          location: eventData.location || '',
          category: eventData.category || 'General',
          status: 'draft',
          organizer_id: currentUser._id,
          max_attendees: eventData.maxAttendees,
          price: eventData.price || 0,
          image_url: eventData.imageUrl,
          venue_name: eventData.venueName,
          venue_address: eventData.venueAddress,
          is_online: eventData.isOnline || false,
          online_link: eventData.onlineLink
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        return { ok: false, message: 'Failed to create event.' };
      }

      // Transform the created event to match Event type
      const newEvent: Event = {
        _id: data.id,
        title: data.title,
        description: data.description,
        startDate: data.start_date,
        endDate: data.end_date,
        location: data.location,
        category: data.category,
        status: 'DRAFT',
        ownerId: data.organizer_id || '',
        maxAttendees: data.max_attendees,
        price: data.price,
        imageUrl: data.image_url,
        venueName: data.venue_name,
        venueAddress: data.venue_address,
        isOnline: data.is_online,
        onlineLink: data.online_link,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        waterfall: {
          requirements: {
            title: data.title,
            description: data.description,
            startDate: data.start_date,
            endDate: data.end_date,
            location: data.location,
            category: data.category
          },
          implementation: {
            capacity: data.max_attendees || 100,
            pricing: {
              isPaid: data.price > 0,
              amount: data.price
            }
          }
        },
        summary: {
          title: data.title,
          description: data.description,
          startDate: data.start_date,
          endDate: data.end_date,
          location: data.location,
          category: data.category,
          isPaid: data.price > 0,
          price: data.price,
          capacity: data.max_attendees || 100
        },
        planSnapshot: {
          tier: currentUser.plan || 'FREE',
          constraints
        }
      };

      return { ok: true, message: 'Event saved as draft.', data: newEvent };
    } catch (error) {
      console.error('Error creating event:', error);
      return { ok: false, message: 'Failed to create event.' };
    }
  },

  // POST /api/events/:id/publish
  async publishEvent(eventId: string): Promise<{ ok: boolean, message: string }> {
    try {
      // First, get the event to validate it
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (fetchError || !event) {
        return { ok: false, message: 'Event not found.' };
      }

      const currentUser = JSON.parse(localStorage.getItem('eventease_user') || '{}');
      const constraints = getPlanConstraints(currentUser.plan || 'FREE');

      // Validation Checks
      if (!event.title || !event.max_attendees) {
        return { ok: false, message: 'Title and Capacity are required to publish.' };
      }

      if (currentUser.plan === 'FREE') {
        if (event.max_attendees > constraints.maxCapacity) {
          return { ok: false, message: 'Your plan has a capacity limit. Please upgrade.' };
        }
        if (event.price > 0) {
          return { ok: false, message: 'Your plan does not allow paid events. Please upgrade.' };
        }
      }

      // Update the event status to published
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (updateError) {
        console.error('Error publishing event:', updateError);
        return { ok: false, message: 'Failed to publish event.' };
      }

      return { ok: true, message: 'Event published successfully!' };
    } catch (error) {
      console.error('Error publishing event:', error);
      return { ok: false, message: 'Failed to publish event.' };
    }
  }
};
