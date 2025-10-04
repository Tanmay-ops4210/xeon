// src/services/organizerCrudService.ts
import { supabase } from '../lib/supabaseConfig';

// Interfaces for organizer service
export interface OrganizerEvent {
  id: string;
  organizer_id: string;
  title: string;
  description?: string;
  category: string;
  event_date: string;
  time: string;
  end_time?: string;
  venue: string;
  capacity: number;
  attendees?: number;
  image_url?: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'unlisted';
  created_at: string;
  updated_at: string;
  price?: number;
  currency?: string;
}

export interface OrganizerTicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  sold: number;
  sale_start: string;
  sale_end?: string;
  is_active: boolean;
  benefits: string[];
  restrictions: string[];
  created_at: string;
}

export interface Speaker {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  imageUrl: string;
}

export interface Sponsor {
    id: string;
    name: string;
    logoUrl: string;
    website: string;
    tier: string;
}

export interface ScheduleItem {
    id: string;
    startTime: string;
    endTime: string;
    title: string;
    description: string;
}


export interface OrganizerEventAnalytics {
  id: string;
  event_id: string;
  views: number;
  registrations: number;
  conversion_rate: number;
  revenue: number;
  top_referrers: string[];
  created_at: string;
  updated_at: string;
}

export interface OrganizerAttendee {
  id: string;
  event_id: string;
  user_id: string;
  ticket_type_id?: string;
  registration_date: string;
  check_in_status: 'pending' | 'checked-in' | 'no-show';
  payment_status: 'pending' | 'completed' | 'refunded';
  additional_info: Record<string, unknown>;
  user?: {
    full_name: string;
    email: string;
  };
  ticket_type?: {
    name: string;
    price: number;
  };
}

export interface MarketingCampaign {
  id: string;
  event_id: string;
  name: string;
  type: 'email' | 'social' | 'sms' | 'push';
  subject?: string;
  content?: string;
  audience?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  sent_date?: string;
  open_rate: number;
  click_rate: number;
  created_at: string;
}

export interface EventFormData {
  title: string;
  description?: string;
  category: string;
  event_date: string;
  time: string;
  end_time?: string;
  venue: string;
  capacity: number;
  image_url?: string;
  imageFile?: File;
  imagePreview?: string;
  visibility: 'public' | 'private' | 'unlisted';
}

export interface TicketFormData {
  name: string;
  description?: string;
  price: number;
  currency: string;
  quantity: number;
  sale_start: string;
  sale_end?: string;
  is_active: boolean;
  benefits: string[];
  restrictions: string[];
}

// Helper to transform raw Supabase event data into the OrganizerEvent format
const transformDbEventToOrganizerEvent = (event: any): OrganizerEvent => ({
    id: event.id,
    organizer_id: event.organizer_id,
    title: event.title,
    description: event.description,
    category: event.category,
    event_date: new Date(event.start_date).toISOString().split('T')[0],
    time: new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    end_time: event.end_date ? new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
    venue: event.location || event.venue_name,
    capacity: event.max_attendees || 0,
    attendees: event.event_attendees?.[0]?.count || 0,
    image_url: event.image_url,
    status: event.status,
    visibility: 'public', // Assuming default visibility
    created_at: event.created_at,
    updated_at: event.updated_at,
    price: event.price
});


class OrganizerCrudService {
  private static instance: OrganizerCrudService;
  private eventListeners: ((events: OrganizerEvent[]) => void)[] = [];

  static getInstance(): OrganizerCrudService {
    if (!OrganizerCrudService.instance) {
      OrganizerCrudService.instance = new OrganizerCrudService();
    }
    return OrganizerCrudService.instance;
  }

  addEventListener(callback: (events: OrganizerEvent[]) => void) {
    this.eventListeners.push(callback);
  }

  removeEventListener(callback: (events: OrganizerEvent[]) => void) {
    this.eventListeners = this.eventListeners.filter(listener => listener !== callback);
  }

  private async notifyEventListeners(organizerId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = organizerId || user?.id;
    
    if (!userId) return;
    
    const result = await this.getMyEvents(userId);
    if (result.success && result.events) {
      this.eventListeners.forEach(callback => callback(result.events!));
    }
  }

  private async checkOrganizerAccess(): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    return { success: true };
  }

  private validateImageFile(file: File): { isValid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' };
    }

    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 5MB limit.' };
    }

    return { isValid: true };
  }

  private async uploadImage(file: File, eventId?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${eventId || Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `event-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: uploadError.message };
      }

      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(filePath);

      return { success: true, url: publicUrl };
    } catch (error) {
      console.error('Image upload error:', error);
      return { success: false, error: 'Failed to upload image' };
    }
  }

  async createEvent(eventData: EventFormData, organizerId: string): Promise<{ success: boolean; event?: OrganizerEvent; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      if (!eventData.title || !eventData.venue || !eventData.event_date || !eventData.time) {
        return { success: false, error: 'Missing required fields: title, venue, date, and time are required' };
      }

      if (eventData.imageFile) {
        const validation = this.validateImageFile(eventData.imageFile);
        if (!validation.isValid) {
          return { success: false, error: validation.error };
        }
      }

      let imageUrl = eventData.image_url;
      if (eventData.imageFile) {
        const uploadResult = await this.uploadImage(eventData.imageFile);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          return { success: false, error: uploadResult.error || 'Failed to upload image' };
        }
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title: eventData.title,
          description: eventData.description || '',
          category: eventData.category || 'conference',
          start_date: `${eventData.event_date}T${eventData.time}:00`,
          end_date: eventData.end_time ? `${eventData.event_date}T${eventData.end_time}:00` : `${eventData.event_date}T${eventData.time}:00`,
          location: eventData.venue,
          venue_name: eventData.venue,
          max_attendees: eventData.capacity,
          image_url: imageUrl,
          status: 'draft',
          is_online: false,
          price: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Create event error:', error);
        return { success: false, error: error.message };
      }

      const newEvent = transformDbEventToOrganizerEvent(data);

      await this.notifyEventListeners(user.id);
      return { success: true, event: newEvent };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: `Failed to create event: ${message}` };
    }
  }

  async getMyEvents(organizerId: string): Promise<{ success: boolean; events?: OrganizerEvent[]; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { data, error } = await supabase
        .from('events')
        .select(`*, event_attendees(count)`)
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get events error:', error);
        return { success: false, error: error.message };
      }

      const events: OrganizerEvent[] = (data || []).map(transformDbEventToOrganizerEvent);

      return { success: true, events };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: `Failed to fetch events: ${message}` };
    }
  }
  
  async getPublishedEvents(): Promise<{ success: boolean; events?: OrganizerEvent[]; error?: string }> {
    try {
        const { data, error } = await supabase
            .from('events')
            .select(`*, event_attendees(count)`)
            .eq('status', 'published')
            .order('start_date', { ascending: true });

        if (error) {
            console.error('Get published events error:', error);
            return { success: false, error: error.message };
        }

        const events: OrganizerEvent[] = (data || []).map(transformDbEventToOrganizerEvent);

        return { success: true, events };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: `Failed to fetch published events: ${message}` };
    }
  }


  async getEventById(eventId: string): Promise<{ success: boolean; event?: OrganizerEvent; error?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        let query = supabase
            .from('events')
            .select(`*, event_attendees(count)`)
            .eq('id', eventId);

        // If user is not logged in, they can only see published events
        if (!user) {
            query = query.eq('status', 'published');
        } else {
            // If logged in, they can see their own events (any status) OR any published event
            query = query.or(`organizer_id.eq.${user.id},status.eq.published`);
        }

        const { data, error } = await query.single();
        
        if (error) {
            console.error('Get event by ID error:', error);
            return { success: false, error: 'Event not found or you do not have permission to view it.' };
        }
        
        if (!data) {
            return { success: false, error: 'Event not found' };
        }

        const event = transformDbEventToOrganizerEvent(data);
        return { success: true, event };

    } catch (error) {
        const message = error instanceof Error ? error.message : 'An unexpected error occurred';
        return { success: false, error: `Failed to fetch event: ${message}` };
    }
  }


  async updateEvent(eventId: string, updates: Partial<EventFormData>): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      if (updates.imageFile) {
        const validation = this.validateImageFile(updates.imageFile);
        if (!validation.isValid) {
          return { success: false, error: validation.error };
        }
      }

      let imageUrl = updates.image_url;
      if (updates.imageFile) {
        const uploadResult = await this.uploadImage(updates.imageFile, eventId);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          return { success: false, error: uploadResult.error || 'Failed to upload image' };
        }
      }

      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.category) updateData.category = updates.category;
      if (updates.event_date && updates.time) {
        updateData.start_date = `${updates.event_date}T${updates.time}:00`;
        if (updates.end_time) {
          updateData.end_date = `${updates.event_date}T${updates.end_time}:00`;
        }
      }
      if (updates.venue) {
        updateData.location = updates.venue;
        updateData.venue_name = updates.venue;
      }
      if (updates.capacity) updateData.max_attendees = updates.capacity;
      if (imageUrl) updateData.image_url = imageUrl;

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId)
        .eq('organizer_id', user.id);

      if (error) {
        console.error('Update event error:', error);
        return { success: false, error: error.message };
      }

      await this.notifyEventListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update event' };
    }
  }

  async publishEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('events')
        .update({ status: 'published' })
        .eq('id', eventId)
        .eq('organizer_id', user.id);

      if (error) {
        console.error('Publish event error:', error);
        return { success: false, error: error.message };
      }

      await this.notifyEventListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to publish event' };
    }
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('organizer_id', user.id);

      if (error) {
        console.error('Delete event error:', error);
        return { success: false, error: error.message };
      }

      await this.notifyEventListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete event' };
    }
  }

  async getEventAnalytics(eventId: string): Promise<{ success: boolean; analytics?: OrganizerEventAnalytics; error?: string }> {
    // ... existing implementation ...
     try {
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }
      const { count } = await supabase.from('event_attendees').select('*', { count: 'exact', head: true }).eq('event_id', eventId);
      const registrations = count || 0;
      const mockAnalytics: OrganizerEventAnalytics = {
        id: 'analytics_1',
        event_id: eventId,
        views: 1250,
        registrations,
        conversion_rate: registrations > 0 ? (registrations / 1250) * 100 : 0,
        revenue: registrations * 150,
        top_referrers: ['Direct', 'Social Media', 'Email'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return { success: true, analytics: mockAnalytics };
    } catch (error) {
      return { success: false, error: 'Failed to fetch analytics' };
    }
  }

  async getEventAttendees(eventId: string): Promise<{ success: boolean; attendees?: OrganizerAttendee[]; error?: string }> {
    // ... existing implementation ...
     try {
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }
      const { data, error } = await supabase.from('event_attendees').select(`*, user_profiles!inner(full_name, email)`).eq('event_id', eventId);
      if (error) {
        console.error('Get attendees error:', error);
        return { success: false, error: error.message };
      }
      const attendees: OrganizerAttendee[] = (data || []).map((attendee: any) => ({
        id: attendee.id,
        event_id: attendee.event_id,
        user_id: attendee.user_id,
        ticket_type_id: attendee.ticket_type,
        registration_date: attendee.registration_date,
        check_in_status: attendee.status || 'pending',
        payment_status: attendee.payment_status,
        additional_info: attendee.notes ? { notes: attendee.notes } : {},
        user: { full_name: attendee.user_profiles?.full_name || 'Unknown', email: attendee.user_profiles?.email || 'unknown@email.com' }
      }));
      return { success: true, attendees };
    } catch (error) {
      return { success: false, error: 'Failed to fetch attendees' };
    }
  }

  async createTicketType(eventId: string, ticketData: TicketFormData): Promise<{ success: boolean; ticket?: OrganizerTicketType; error?: string }> {
    const newTicket: OrganizerTicketType = { id: `ticket_${Date.now()}`, event_id: eventId, ...ticketData, sold: 0, created_at: new Date().toISOString() };
    return { success: true, ticket: newTicket };
  }

  async getTicketTypes(eventId: string): Promise<{ success: boolean; tickets?: OrganizerTicketType[]; error?: string }> {
    console.log(`Fetching mock tickets for event ${eventId}`);
    return { success: true, tickets: [] };
  }

  async updateTicketType(ticketId: string, updates: Partial<TicketFormData>): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  async deleteTicketType(ticketId: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  async createCampaign(eventId: string, campaignData: Partial<MarketingCampaign>): Promise<{ success: boolean; campaign?: MarketingCampaign; error?: string }> {
    const newCampaign: MarketingCampaign = { id: `campaign_${Date.now()}`, event_id: eventId, name: campaignData.name || 'New Campaign', type: campaignData.type || 'email', status: 'draft', open_rate: 0, click_rate: 0, created_at: new Date().toISOString(), ...campaignData };
    return { success: true, campaign: newCampaign };
  }

  async getCampaigns(eventId: string): Promise<{ success: boolean; campaigns?: MarketingCampaign[]; error?: string }> {
    return { success: true, campaigns: [] };
  }

  async updateCampaign(campaignId: string, updates: Partial<MarketingCampaign>): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  async deleteCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  // --- NEWLY ADDED/IMPLEMENTED METHODS ---

  async getEventSpeakers(eventId: string): Promise<{ success: boolean; speakers?: Speaker[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('event_speakers')
        .select('speakers(*)')
        .eq('event_id', eventId);
      if (error) throw error;
      const speakers = data.map((item: any) => ({
        id: item.speakers.id,
        name: item.speakers.name,
        title: item.speakers.title,
        company: item.speakers.company,
        bio: item.speakers.bio,
        imageUrl: item.speakers.image_url
      }));
      return { success: true, speakers };
    } catch (error: any) {
      console.error("Error fetching speakers:", error);
      return { success: false, error: 'Failed to fetch speakers: ' + error.message };
    }
  }

  async getEventSponsors(eventId: string): Promise<{ success: boolean; sponsors?: Sponsor[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('event_sponsors')
        .select('sponsors(*)')
        .eq('event_id', eventId);
      if (error) throw error;
      const sponsors = data.map((item: any) => ({
        id: item.sponsors.id,
        name: item.sponsors.name,
        logoUrl: item.sponsors.logo_url,
        website: item.sponsors.website_url,
        tier: item.sponsors.tier
      }));
      return { success: true, sponsors };
    } catch (error: any) {
      console.error("Error fetching sponsors:", error);
      return { success: false, error: 'Failed to fetch sponsors: ' + error.message };
    }
  }

  async getEventSchedule(eventId: string): Promise<{ success: boolean; schedule?: ScheduleItem[]; error?: string }> {
    console.log(`Fetching schedule for event ${eventId} (mock)`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, schedule: [] }), 200));
  }
  
  async saveEventSpeakers(eventId: string, speakers: any[]): Promise<{ success: boolean; error?: string }> {
    try {
      const speakerUpserts = speakers.map(s => ({
        name: s.name,
        title: s.title,
        company: s.company,
        bio: s.bio,
        image_url: s.image,
      }));
      
      const { data: upsertedSpeakers, error: upsertError } = await supabase
        .from('speakers')
        .upsert(speakerUpserts, { onConflict: 'name, company' })
        .select('id, name');

      if (upsertError) throw upsertError;

      await supabase.from('event_speakers').delete().eq('event_id', eventId);

      const speakerLinks = upsertedSpeakers.map(us => ({
        event_id: eventId,
        speaker_id: us.id
      }));

      if (speakerLinks.length > 0) {
        const { error: linkError } = await supabase.from('event_speakers').insert(speakerLinks);
        if (linkError) throw linkError;
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Error saving speakers:', error);
      return { success: false, error: 'Failed to save speakers: ' + error.message };
    }
  }

  async saveEventSponsors(eventId: string, sponsors: any[]): Promise<{ success: boolean; error?: string }> {
      try {
          const sponsorUpserts = sponsors.map(s => ({
            name: s.name,
            logo_url: s.logo,
            website_url: s.website,
            tier: s.tier,
            description: s.description
          }));

          const { data: upsertedSponsors, error: upsertError } = await supabase
            .from('sponsors')
            .upsert(sponsorUpserts, { onConflict: 'name' })
            .select('id, name');

          if (upsertError) throw upsertError;
          
          await supabase.from('event_sponsors').delete().eq('event_id', eventId);

          const sponsorLinks = upsertedSponsors.map(us => ({
              event_id: eventId,
              sponsor_id: us.id
          }));
          
          if (sponsorLinks.length > 0) {
            const { error: linkError } = await supabase.from('event_sponsors').insert(sponsorLinks);
            if (linkError) throw linkError;
          }

          return { success: true };
      } catch (error: any) {
          console.error('Error saving sponsors:', error);
          return { success: false, error: 'Failed to save sponsors: ' + error.message };
      }
  }
}

export const organizerCrudService = OrganizerCrudService.getInstance();
