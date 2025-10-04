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

// ADDED: Interfaces for Speakers, Sponsors, and Schedule
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
    // Get authenticated user's ID if not provided
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

      const newEvent: OrganizerEvent = {
        id: data.id,
        organizer_id: data.organizer_id,
        title: data.title,
        description: data.description,
        category: data.category,
        event_date: data.start_date.split('T')[0],
        time: data.start_date.split('T')[1].substring(0, 5),
        end_time: data.end_date ? data.end_date.split('T')[1].substring(0, 5) : undefined,
        venue: data.location,
        capacity: data.max_attendees || 0,
        attendees: 0,
        image_url: data.image_url,
        status: data.status,
        visibility: 'public',
        created_at: data.created_at,
        updated_at: data.updated_at
      };

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

      // Use authenticated user's ID, not the parameter
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_attendees(count)
        `)
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Get events error:', error);
        return { success: false, error: error.message };
      }

      const events: OrganizerEvent[] = (data || []).map((event: any) => ({
        id: event.id,
        organizer_id: event.organizer_id,
        title: event.title,
        description: event.description,
        category: event.category,
        event_date: event.start_date.split('T')[0],
        time: event.start_date.split('T')[1].substring(0, 5),
        end_time: event.end_date ? event.end_date.split('T')[1].substring(0, 5) : undefined,
        venue: event.location || event.venue_name,
        capacity: event.max_attendees || 0,
        attendees: event.event_attendees?.[0]?.count || 0,
        image_url: event.image_url,
        status: event.status,
        visibility: 'public',
        created_at: event.created_at,
        updated_at: event.updated_at,
        price: event.price
      }));

      return { success: true, events };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: `Failed to fetch events: ${message}` };
    }
  }

  async getEventById(eventId: string): Promise<{ success: boolean; event?: OrganizerEvent; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // RLS-compatible query: filter by both event ID and organizer ID
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .eq('organizer_id', user.id)
        .single();

      if (error) {
        console.error('Get event error:', error);
        return { success: false, error: error.message };
      }

      if (!data) {
        return { success: false, error: 'Event not found' };
      }

      const event: OrganizerEvent = {
        id: data.id,
        organizer_id: data.organizer_id,
        title: data.title,
        description: data.description,
        category: data.category,
        event_date: data.start_date.split('T')[0],
        time: data.start_date.split('T')[1].substring(0, 5),
        end_time: data.end_date ? data.end_date.split('T')[1].substring(0, 5) : undefined,
        venue: data.location || data.venue_name,
        capacity: data.max_attendees || 0,
        image_url: data.image_url,
        status: data.status,
        visibility: 'public',
        created_at: data.created_at,
        updated_at: data.updated_at,
        price: data.price
      };

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

      // RLS will ensure user can only update their own events
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

      // RLS will ensure user can only publish their own events
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

      // RLS will ensure user can only delete their own events
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
    try {
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Get attendee count
      const { count } = await supabase
        .from('event_attendees')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      const registrations = count || 0;

      // Mock analytics data (can be enhanced with real data later)
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
    try {
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          user_profiles!inner(full_name, email)
        `)
        .eq('event_id', eventId);

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
        user: {
          full_name: attendee.user_profiles?.full_name || 'Unknown',
          email: attendee.user_profiles?.email || 'unknown@email.com'
        }
      }));

      return { success: true, attendees };
    } catch (error) {
      return { success: false, error: 'Failed to fetch attendees' };
    }
  }

  // Ticket type methods
  async createTicketType(eventId: string, ticketData: TicketFormData): Promise<{ success: boolean; ticket?: OrganizerTicketType; error?: string }> {
    // This is still a mock implementation until you build the UI to create real tickets
    const newTicket: OrganizerTicketType = {
      id: `ticket_${Date.now()}`,
      event_id: eventId,
      ...ticketData,
      sold: 0,
      created_at: new Date().toISOString()
    };
    console.log("Mock creating ticket:", newTicket);
    return { success: true, ticket: newTicket };
  }

  async getTicketTypes(eventId: string): Promise<{ success: boolean; tickets?: OrganizerTicketType[]; error?: string }> {
    // This is also a mock implementation
    console.log(`Fetching mock tickets for event ${eventId}`);
    const mockTickets: OrganizerTicketType[] = [
        // You can add some default mock tickets here if you want for testing
    ];
    return { success: true, tickets: mockTickets };
  }

  async updateTicketType(ticketId: string, updates: Partial<TicketFormData>): Promise<{ success: boolean; error?: string }> {
    console.log(`Mock updating ticket ${ticketId} with`, updates);
    return { success: true };
  }

  async deleteTicketType(ticketId: string): Promise<{ success: boolean; error?: string }> {
    console.log(`Mock deleting ticket ${ticketId}`);
    return { success: true };
  }

  // Marketing campaign methods (mock implementation)
  async createCampaign(eventId: string, campaignData: Partial<MarketingCampaign>): Promise<{ success: boolean; campaign?: MarketingCampaign; error?: string }> {
    const newCampaign: MarketingCampaign = {
      id: `campaign_${Date.now()}`,
      event_id: eventId,
      name: campaignData.name || 'New Campaign',
      type: campaignData.type || 'email',
      status: 'draft',
      open_rate: 0,
      click_rate: 0,
      created_at: new Date().toISOString(),
      ...campaignData
    };
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
  
  // ADDED: Method to get speakers for a specific event
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
    } catch (error) {
        console.error("Error fetching speakers:", error);
        return { success: false, error: 'Failed to fetch speakers' };
    }
  }

  // ADDED: Method to get sponsors for a specific event
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
    } catch (error) {
        console.error("Error fetching sponsors:", error);
        return { success: false, error: 'Failed to fetch sponsors' };
    }
  }

  // ADDED: Mock method to get schedule for a specific event
  async getEventSchedule(eventId: string): Promise<{ success: boolean; schedule?: ScheduleItem[]; error?: string }> {
    // This is a mock implementation as the schedule table/logic isn't fully built out.
    // In a real app, you would fetch this from a 'schedule_items' table.
    console.log(`Fetching schedule for event ${eventId} (mock)`);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, schedule: [] }), 200));
  }
}

export const organizerCrudService = OrganizerCrudService.getInstance();
