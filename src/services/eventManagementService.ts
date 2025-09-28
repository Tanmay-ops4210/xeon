import { supabase } from '../lib/supabase';
import { 
  Event, 
  EventFormData, 
  EventListResponse, 
  EventCreateResponse, 
  EventUpdateResponse, 
  EventDeleteResponse,
  EventSearchParams,
  EventFilters,
  TicketType,
  Speaker,
  ScheduleItem,
  EventRegistration,
  OrganizerDashboard,
  AttendeeDashboard,
  EventValidationErrors,
  TicketTypeValidationErrors,
  SpeakerValidationErrors,
  ScheduleItemValidationErrors
} from '../types/eventManagement';
import { storageService } from './storageService';

/**
 * Event Management Service
 * Handles all CRUD operations for events, tickets, speakers, and schedules
 */

// Event CRUD Operations
export const eventService = {
  /**
   * Create a new event
   */
  async createEvent(formData: EventFormData, organizerId: string): Promise<EventCreateResponse> {
    try {
      // Upload event image
      let imageUrl = '';
      if (formData.image instanceof File) {
        const imageResult = await storageService.uploadEventImage(formData.image, undefined);
        if (!imageResult.success) {
          return { success: false, error: `Image upload failed: ${imageResult.error}` };
        }
        imageUrl = imageResult.url!;
      } else if (typeof formData.image === 'string') {
        imageUrl = formData.image;
      }

      // Upload organizer avatar
      let organizerAvatarUrl = '';
      if (formData.organizer.avatar instanceof File) {
        const avatarResult = await storageService.uploadOrganizerAvatar(formData.organizer.avatar, organizerId);
        if (!avatarResult.success) {
          return { success: false, error: `Organizer avatar upload failed: ${avatarResult.error}` };
        }
        organizerAvatarUrl = avatarResult.url!;
      } else if (typeof formData.organizer.avatar === 'string') {
        organizerAvatarUrl = formData.organizer.avatar;
      }

      // Upload gallery images
      const galleryUrls: string[] = [];
      if (formData.gallery.length > 0) {
        const galleryFiles = formData.gallery.filter(file => file instanceof File) as File[];
        if (galleryFiles.length > 0) {
          // We'll upload gallery after creating the event
          const tempEventId = `temp_${Date.now()}`;
          const galleryResult = await storageService.uploadEventGallery(galleryFiles, tempEventId);
          if (galleryResult.successCount > 0) {
            galleryUrls.push(...galleryResult.results
              .filter(result => result.success)
              .map(result => result.url!)
            );
          }
        }
        
        // Add existing gallery URLs
        const existingUrls = formData.gallery.filter(url => typeof url === 'string') as string[];
        galleryUrls.push(...existingUrls);
      }

      // Create event in database
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          organizer_id: organizerId,
          title: formData.title,
          description: formData.description,
          full_description: formData.fullDescription,
          category: formData.category,
          tags: formData.tags,
          start_date: formData.startDate,
          end_date: formData.endDate,
          timezone: formData.timezone,
          venue_name: formData.venue.name,
          venue_address: formData.venue.address,
          city: formData.venue.city,
          state: formData.venue.state,
          country: formData.venue.country,
          zip_code: formData.venue.zipCode,
          capacity: formData.venue.capacity,
          venue_type: formData.venue.type,
          amenities: formData.venue.amenities,
          coordinates: formData.venue.coordinates,
          virtual_link: formData.venue.virtualLink,
          image_url: imageUrl,
          gallery: galleryUrls,
          currency: formData.currency,
          max_attendees: formData.maxAttendees,
          registration_deadline: formData.registrationDeadline,
          require_approval: formData.requireApproval,
          allow_waitlist: formData.allowWaitlist,
          max_tickets_per_person: formData.maxTicketsPerPerson,
          what_to_expect: formData.whatToExpect,
          requirements: formData.requirements,
          refund_policy: formData.refundPolicy,
          organizer_name: formData.organizer.name,
          organizer_bio: formData.organizer.bio,
          organizer_contact: formData.organizer.contact,
          organizer_avatar: organizerAvatarUrl,
          visibility: formData.visibility,
          status: formData.status
        })
        .select()
        .single();

      if (eventError) {
        console.error('Event creation error:', eventError);
        return { success: false, error: `Failed to create event: ${eventError.message}` };
      }

      const eventId = eventData.id;

      // Create ticket types
      if (formData.ticketTypes.length > 0) {
        const ticketTypesData = formData.ticketTypes.map(ticket => ({
          event_id: eventId,
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          currency: formData.currency,
          quantity: ticket.quantity,
          benefits: ticket.benefits,
          restrictions: ticket.restrictions,
          sale_start: ticket.saleStart,
          sale_end: ticket.saleEnd,
          is_active: ticket.isActive
        }));

        const { error: ticketsError } = await supabase
          .from('ticket_types')
          .insert(ticketTypesData);

        if (ticketsError) {
          console.error('Ticket types creation error:', ticketsError);
          // Don't fail the entire operation, just log the error
        }
      }

      // Create speakers
      if (formData.speakers.length > 0) {
        for (const speaker of formData.speakers) {
          let speakerImageUrl = '';
          if (speaker.image instanceof File) {
            const speakerImageResult = await storageService.uploadSpeakerImage(speaker.image, speaker.id || `speaker_${Date.now()}`, eventId);
            if (speakerImageResult.success) {
              speakerImageUrl = speakerImageResult.url!;
            }
          } else if (typeof speaker.image === 'string') {
            speakerImageUrl = speaker.image;
          }

          const { error: speakerError } = await supabase
            .from('speakers')
            .insert({
              event_id: eventId,
              name: speaker.name,
              title: speaker.title,
              company: speaker.company,
              bio: speaker.bio,
              image_url: speakerImageUrl,
              social_linkedin: speaker.socialLinks.linkedin,
              social_twitter: speaker.socialLinks.twitter,
              social_website: speaker.socialLinks.website,
              sessions: speaker.sessions
            });

          if (speakerError) {
            console.error('Speaker creation error:', speakerError);
            // Don't fail the entire operation, just log the error
          }
        }
      }

      // Create schedule items
      if (formData.schedule.length > 0) {
        const scheduleData = formData.schedule.map(item => ({
          event_id: eventId,
          start_time: item.startTime,
          end_time: item.endTime,
          title: item.title,
          description: item.description,
          speaker_id: item.speakerId,
          room: item.room,
          type: item.type
        }));

        const { error: scheduleError } = await supabase
          .from('schedule_items')
          .insert(scheduleData);

        if (scheduleError) {
          console.error('Schedule creation error:', scheduleError);
          // Don't fail the entire operation, just log the error
        }
      }

      // Fetch the complete event with all related data
      const completeEvent = await this.getEventById(eventId);
      if (!completeEvent) {
        return { success: false, error: 'Event created but failed to fetch complete data' };
      }

      return { success: true, event: completeEvent };

    } catch (error) {
      console.error('Event creation error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },

  /**
   * Get event by ID
   */
  async getEventById(eventId: string): Promise<Event | null> {
    try {
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select(`
          *,
          ticket_types (*),
          speakers (*),
          schedule_items (*)
        `)
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Event fetch error:', eventError);
        return null;
      }

      return this.transformEventData(eventData);
    } catch (error) {
      console.error('Event fetch error:', error);
      return null;
    }
  },

  /**
   * Get events by organizer
   */
  async getEventsByOrganizer(organizerId: string, filters?: EventFilters): Promise<EventListResponse> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          ticket_types (*),
          speakers (*),
          schedule_items (*)
        `)
        .eq('organizer_id', organizerId);

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.visibility) {
          query = query.eq('visibility', filters.visibility);
        }
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.dateRange) {
          query = query.gte('start_date', filters.dateRange.start);
          query = query.lte('end_date', filters.dateRange.end);
        }
        if (filters.location?.city) {
          query = query.eq('city', filters.location.city);
        }
        if (filters.location?.type) {
          query = query.eq('venue_type', filters.location.type);
        }
      }

      const { data: eventsData, error: eventsError, count } = await query
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('Events fetch error:', eventsError);
        return { events: [], total: 0, page: 1, limit: 10, hasMore: false };
      }

      const events = eventsData?.map(event => this.transformEventData(event)) || [];

      return {
        events,
        total: count || 0,
        page: 1,
        limit: 10,
        hasMore: false // Implement pagination if needed
      };
    } catch (error) {
      console.error('Events fetch error:', error);
      return { events: [], total: 0, page: 1, limit: 10, hasMore: false };
    }
  },

  /**
   * Get published events for discovery
   */
  async getPublishedEvents(searchParams: EventSearchParams): Promise<EventListResponse> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          ticket_types (*),
          speakers (*),
          schedule_items (*)
        `)
        .eq('status', 'published')
        .eq('visibility', 'public');

      // Apply search query
      if (searchParams.query) {
        query = query.or(`title.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%,category.ilike.%${searchParams.query}%`);
      }

      // Apply filters
      if (searchParams.filters) {
        const filters = searchParams.filters;
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
        if (filters.dateRange) {
          query = query.gte('start_date', filters.dateRange.start);
          query = query.lte('end_date', filters.dateRange.end);
        }
        if (filters.location?.city) {
          query = query.eq('city', filters.location.city);
        }
        if (filters.location?.type) {
          query = query.eq('venue_type', filters.location.type);
        }
        if (filters.priceRange) {
          query = query.gte('price', filters.priceRange.min);
          query = query.lte('price', filters.priceRange.max);
        }
        if (filters.tags && filters.tags.length > 0) {
          query = query.overlaps('tags', filters.tags);
        }
      }

      // Apply sorting
      const sortBy = searchParams.sortBy || 'start_date';
      const sortOrder = searchParams.sortOrder || 'asc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      const page = searchParams.page || 1;
      const limit = searchParams.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data: eventsData, error: eventsError, count } = await query;

      if (eventsError) {
        console.error('Published events fetch error:', eventsError);
        return { events: [], total: 0, page: 1, limit: 10, hasMore: false };
      }

      const events = eventsData?.map(event => this.transformEventData(event)) || [];
      const hasMore = (count || 0) > page * limit;

      return {
        events,
        total: count || 0,
        page,
        limit,
        hasMore
      };
    } catch (error) {
      console.error('Published events fetch error:', error);
      return { events: [], total: 0, page: 1, limit: 10, hasMore: false };
    }
  },

  /**
   * Update event
   */
  async updateEvent(eventId: string, formData: EventFormData, organizerId: string): Promise<EventUpdateResponse> {
    try {
      // Get existing event
      const existingEvent = await this.getEventById(eventId);
      if (!existingEvent) {
        return { success: false, error: 'Event not found' };
      }

      // Check if user owns the event
      if (existingEvent.organizerId !== organizerId) {
        return { success: false, error: 'Unauthorized to update this event' };
      }

      // Handle image updates
      let imageUrl = existingEvent.imageUrl;
      if (formData.image instanceof File) {
        // Delete old image if exists
        if (existingEvent.imageUrl) {
          await storageService.deleteEventImage(existingEvent.imageUrl);
        }
        
        const imageResult = await storageService.uploadEventImage(formData.image, eventId);
        if (!imageResult.success) {
          return { success: false, error: `Image upload failed: ${imageResult.error}` };
        }
        imageUrl = imageResult.url!;
      } else if (typeof formData.image === 'string') {
        imageUrl = formData.image;
      }

      // Handle organizer avatar updates
      let organizerAvatarUrl = existingEvent.organizer.avatar;
      if (formData.organizer.avatar instanceof File) {
        // Delete old avatar if exists
        if (existingEvent.organizer.avatar) {
          await storageService.deleteProfilePicture(existingEvent.organizer.avatar);
        }
        
        const avatarResult = await storageService.uploadOrganizerAvatar(formData.organizer.avatar, organizerId);
        if (!avatarResult.success) {
          return { success: false, error: `Organizer avatar upload failed: ${avatarResult.error}` };
        }
        organizerAvatarUrl = avatarResult.url!;
      } else if (typeof formData.organizer.avatar === 'string') {
        organizerAvatarUrl = formData.organizer.avatar;
      }

      // Handle gallery updates
      const galleryUrls: string[] = [];
      if (formData.gallery.length > 0) {
        const galleryFiles = formData.gallery.filter(file => file instanceof File) as File[];
        if (galleryFiles.length > 0) {
          const galleryResult = await storageService.uploadEventGallery(galleryFiles, eventId);
          if (galleryResult.successCount > 0) {
            galleryUrls.push(...galleryResult.results
              .filter(result => result.success)
              .map(result => result.url!)
            );
          }
        }
        
        const existingUrls = formData.gallery.filter(url => typeof url === 'string') as string[];
        galleryUrls.push(...existingUrls);
      }

      // Update event in database
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          full_description: formData.fullDescription,
          category: formData.category,
          tags: formData.tags,
          start_date: formData.startDate,
          end_date: formData.endDate,
          timezone: formData.timezone,
          venue_name: formData.venue.name,
          venue_address: formData.venue.address,
          city: formData.venue.city,
          state: formData.venue.state,
          country: formData.venue.country,
          zip_code: formData.venue.zipCode,
          capacity: formData.venue.capacity,
          venue_type: formData.venue.type,
          amenities: formData.venue.amenities,
          coordinates: formData.venue.coordinates,
          virtual_link: formData.venue.virtualLink,
          image_url: imageUrl,
          gallery: galleryUrls,
          currency: formData.currency,
          max_attendees: formData.maxAttendees,
          registration_deadline: formData.registrationDeadline,
          require_approval: formData.requireApproval,
          allow_waitlist: formData.allowWaitlist,
          max_tickets_per_person: formData.maxTicketsPerPerson,
          what_to_expect: formData.whatToExpect,
          requirements: formData.requirements,
          refund_policy: formData.refundPolicy,
          organizer_name: formData.organizer.name,
          organizer_bio: formData.organizer.bio,
          organizer_contact: formData.organizer.contact,
          organizer_avatar: organizerAvatarUrl,
          visibility: formData.visibility,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single();

      if (eventError) {
        console.error('Event update error:', eventError);
        return { success: false, error: `Failed to update event: ${eventError.message}` };
      }

      // Update ticket types
      if (formData.ticketTypes.length > 0) {
        // Delete existing ticket types
        await supabase
          .from('ticket_types')
          .delete()
          .eq('event_id', eventId);

        // Insert new ticket types
        const ticketTypesData = formData.ticketTypes.map(ticket => ({
          event_id: eventId,
          name: ticket.name,
          description: ticket.description,
          price: ticket.price,
          currency: formData.currency,
          quantity: ticket.quantity,
          benefits: ticket.benefits,
          restrictions: ticket.restrictions,
          sale_start: ticket.saleStart,
          sale_end: ticket.saleEnd,
          is_active: ticket.isActive
        }));

        const { error: ticketsError } = await supabase
          .from('ticket_types')
          .insert(ticketTypesData);

        if (ticketsError) {
          console.error('Ticket types update error:', ticketsError);
        }
      }

      // Update speakers
      if (formData.speakers.length > 0) {
        // Delete existing speakers
        await supabase
          .from('speakers')
          .delete()
          .eq('event_id', eventId);

        // Insert new speakers
        for (const speaker of formData.speakers) {
          let speakerImageUrl = '';
          if (speaker.image instanceof File) {
            const speakerImageResult = await storageService.uploadSpeakerImage(speaker.image, speaker.id || `speaker_${Date.now()}`, eventId);
            if (speakerImageResult.success) {
              speakerImageUrl = speakerImageResult.url!;
            }
          } else if (typeof speaker.image === 'string') {
            speakerImageUrl = speaker.image;
          }

          await supabase
            .from('speakers')
            .insert({
              event_id: eventId,
              name: speaker.name,
              title: speaker.title,
              company: speaker.company,
              bio: speaker.bio,
              image_url: speakerImageUrl,
              social_linkedin: speaker.socialLinks.linkedin,
              social_twitter: speaker.socialLinks.twitter,
              social_website: speaker.socialLinks.website,
              sessions: speaker.sessions
            });
        }
      }

      // Update schedule items
      if (formData.schedule.length > 0) {
        // Delete existing schedule items
        await supabase
          .from('schedule_items')
          .delete()
          .eq('event_id', eventId);

        // Insert new schedule items
        const scheduleData = formData.schedule.map(item => ({
          event_id: eventId,
          start_time: item.startTime,
          end_time: item.endTime,
          title: item.title,
          description: item.description,
          speaker_id: item.speakerId,
          room: item.room,
          type: item.type
        }));

        await supabase
          .from('schedule_items')
          .insert(scheduleData);
      }

      // Fetch the updated event
      const updatedEvent = await this.getEventById(eventId);
      if (!updatedEvent) {
        return { success: false, error: 'Event updated but failed to fetch updated data' };
      }

      return { success: true, event: updatedEvent };

    } catch (error) {
      console.error('Event update error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },

  /**
   * Delete event
   */
  async deleteEvent(eventId: string, organizerId: string): Promise<EventDeleteResponse> {
    try {
      // Get existing event
      const existingEvent = await this.getEventById(eventId);
      if (!existingEvent) {
        return { success: false, error: 'Event not found' };
      }

      // Check if user owns the event
      if (existingEvent.organizerId !== organizerId) {
        return { success: false, error: 'Unauthorized to delete this event' };
      }

      // Delete associated data first
      await supabase.from('ticket_types').delete().eq('event_id', eventId);
      await supabase.from('speakers').delete().eq('event_id', eventId);
      await supabase.from('schedule_items').delete().eq('event_id', eventId);
      await supabase.from('event_registrations').delete().eq('event_id', eventId);

      // Delete event
      const { error: eventError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (eventError) {
        console.error('Event deletion error:', eventError);
        return { success: false, error: `Failed to delete event: ${eventError.message}` };
      }

      // Delete associated files from storage
      if (existingEvent.imageUrl) {
        await storageService.deleteEventImage(existingEvent.imageUrl);
      }
      if (existingEvent.gallery.length > 0) {
        await storageService.deleteEventGallery(existingEvent.gallery);
      }

      return { success: true };

    } catch (error) {
      console.error('Event deletion error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },

  /**
   * Publish event
   */
  async publishEvent(eventId: string, organizerId: string): Promise<EventUpdateResponse> {
    try {
      // Get existing event
      const existingEvent = await this.getEventById(eventId);
      if (!existingEvent) {
        return { success: false, error: 'Event not found' };
      }

      // Check if user owns the event
      if (existingEvent.organizerId !== organizerId) {
        return { success: false, error: 'Unauthorized to publish this event' };
      }

      // Update event status
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .update({
          status: 'published',
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)
        .select()
        .single();

      if (eventError) {
        console.error('Event publish error:', eventError);
        return { success: false, error: `Failed to publish event: ${eventError.message}` };
      }

      const updatedEvent = this.transformEventData(eventData);
      return { success: true, event: updatedEvent };

    } catch (error) {
      console.error('Event publish error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  },

  /**
   * Transform database event data to Event type
   */
  transformEventData(data: any): Event {
    return {
      id: data.id,
      organizerId: data.organizer_id,
      title: data.title,
      description: data.description,
      fullDescription: data.full_description,
      category: data.category,
      tags: data.tags || [],
      startDate: data.start_date,
      endDate: data.end_date,
      timezone: data.timezone,
      venue: {
        name: data.venue_name,
        address: data.venue_address,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zip_code,
        capacity: data.capacity,
        type: data.venue_type,
        amenities: data.amenities || [],
        coordinates: data.coordinates,
        virtualLink: data.virtual_link
      },
      imageUrl: data.image_url || '',
      gallery: data.gallery || [],
      ticketTypes: data.ticket_types?.map((ticket: any) => ({
        id: ticket.id,
        eventId: ticket.event_id,
        name: ticket.name,
        description: ticket.description,
        price: ticket.price,
        currency: ticket.currency,
        quantity: ticket.quantity,
        available: ticket.available || ticket.quantity,
        benefits: ticket.benefits || [],
        restrictions: ticket.restrictions || [],
        saleStart: ticket.sale_start,
        saleEnd: ticket.sale_end,
        isActive: ticket.is_active,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at
      })) || [],
      currency: data.currency,
      maxAttendees: data.max_attendees,
      currentAttendees: data.current_attendees || 0,
      registrationDeadline: data.registration_deadline,
      requireApproval: data.require_approval,
      allowWaitlist: data.allow_waitlist,
      maxTicketsPerPerson: data.max_tickets_per_person,
      whatToExpect: data.what_to_expect || [],
      requirements: data.requirements || [],
      refundPolicy: data.refund_policy,
      organizer: {
        name: data.organizer_name,
        bio: data.organizer_bio,
        contact: data.organizer_contact,
        avatar: data.organizer_avatar || ''
      },
      speakers: data.speakers?.map((speaker: any) => ({
        id: speaker.id,
        eventId: speaker.event_id,
        name: speaker.name,
        title: speaker.title,
        company: speaker.company,
        bio: speaker.bio,
        imageUrl: speaker.image_url || '',
        socialLinks: {
          linkedin: speaker.social_linkedin,
          twitter: speaker.social_twitter,
          website: speaker.social_website
        },
        sessions: speaker.sessions || [],
        createdAt: speaker.created_at,
        updatedAt: speaker.updated_at
      })) || [],
      schedule: data.schedule_items?.map((item: any) => ({
        id: item.id,
        eventId: item.event_id,
        startTime: item.start_time,
        endTime: item.end_time,
        title: item.title,
        description: item.description,
        speakerId: item.speaker_id,
        room: item.room,
        type: item.type,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })) || [],
      status: data.status,
      visibility: data.visibility,
      isFeatured: data.is_featured || false,
      rating: data.rating,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
};

export default eventService;

