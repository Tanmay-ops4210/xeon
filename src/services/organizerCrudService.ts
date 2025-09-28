// Mock interfaces for organizer service
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
  image_url?: string;
  status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'unlisted';
  created_at: string;
  updated_at: string;
  price?: number;
  currency?: string;
}

// Add attendees property to OrganizerEvent interface
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
  image_url?: string; // This will be set after image upload
  imageFile?: File; // File to be uploaded by backend
  imagePreview?: string; // Preview URL for immediate UI feedback
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

let mockEvents: OrganizerEvent[] = [];

class OrganizerCrudService {
  private static instance: OrganizerCrudService;
  private eventListeners: ((events: OrganizerEvent[]) => void)[] = [];

  static getInstance(): OrganizerCrudService {
    if (!OrganizerCrudService.instance) {
      OrganizerCrudService.instance = new OrganizerCrudService();
    }
    return OrganizerCrudService.instance;
  }

  // Add event listener for real-time updates
  addEventListener(callback: (events: OrganizerEvent[]) => void) {
    this.eventListeners.push(callback);
  }

  removeEventListener(callback: (events: OrganizerEvent[]) => void) {
    this.eventListeners = this.eventListeners.filter(listener => listener !== callback);
  }

  private notifyEventListeners() {
    this.eventListeners.forEach(callback => callback([...mockEvents]));
  }

  // Check if user is authenticated and has organizer role
  private async checkOrganizerAccess(): Promise<{ success: boolean; error?: string }> {
    // Mock access check - always allow for demo
    return { success: true };
  }

  async createEvent(eventData: EventFormData, organizerId: string): Promise<{ success: boolean; event?: OrganizerEvent; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Validate required fields
      if (!eventData.title || !eventData.venue || !eventData.event_date || !eventData.time) {
        return { success: false, error: 'Missing required fields: title, venue, date, and time are required' };
      }

      // Validate image if provided
      if (eventData.imageFile) {
        const validation = this.validateImageFile(eventData.imageFile);
        if (!validation.isValid) {
          return { success: false, error: validation.error };
        }
      }

      // Upload image if provided
      let imageUrl = eventData.image_url;
      if (eventData.imageFile) {
        const uploadResult = await this.uploadImage(eventData.imageFile);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          return { success: false, error: uploadResult.error || 'Failed to upload image' };
        }
      }

      // Mock event creation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newEvent: OrganizerEvent = {
        id: `evt_${Date.now()}`,
        organizer_id: organizerId,
        title: eventData.title,
        description: eventData.description,
        category: eventData.category || 'conference',
        event_date: eventData.event_date,
        time: eventData.time,
        end_time: eventData.end_time,
        venue: eventData.venue,
        capacity: eventData.capacity,
        attendees: 0,
        image_url: imageUrl,
        status: 'draft',
        visibility: eventData.visibility || 'public',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Store the event in mock storage
      mockEvents.push(newEvent);

      // Notify listeners of the change
      this.notifyEventListeners();

      return { success: true, event: newEvent };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: `Failed to create event: ${message}` };
    }
  }

  async getMyEvents(organizerId: string): Promise<{ success: boolean; events?: OrganizerEvent[]; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock events fetch
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter events by organizer
      const organizerEvents = mockEvents.filter(event => event.organizer_id === organizerId);
      
      return { success: true, events: organizerEvents };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: `Failed to fetch events: ${message}` };
    }
  }

  async getEventById(eventId: string): Promise<{ success: boolean; event?: OrganizerEvent; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock event fetch
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const event = mockEvents.find(event => event.id === eventId);
      if (!event) {
        return { success: false, error: 'Event not found' };
      }
      
      return { success: true, event };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: `Failed to fetch event: ${message}` };
    }
  }

  async updateEvent(eventId: string, updates: Partial<EventFormData>): Promise<{ success: boolean; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Validate image if provided
      if (updates.imageFile) {
        const validation = this.validateImageFile(updates.imageFile);
        if (!validation.isValid) {
          return { success: false, error: validation.error };
        }
      }

      // Upload image if provided
      let imageUrl = updates.image_url;
      if (updates.imageFile) {
        const uploadResult = await this.uploadImage(updates.imageFile, eventId);
        if (uploadResult.success && uploadResult.url) {
          imageUrl = uploadResult.url;
        } else {
          return { success: false, error: uploadResult.error || 'Failed to upload image' };
        }
      }

      // Mock update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const eventIndex = mockEvents.findIndex(event => event.id === eventId);
      if (eventIndex === -1) {
        return { success: false, error: 'Event not found' };
      }

      // Remove file-related fields from updates before storing
      const { imageFile, imagePreview, ...eventUpdates } = updates;

      mockEvents[eventIndex] = {
        ...mockEvents[eventIndex],
        ...eventUpdates,
        image_url: imageUrl, // Use the uploaded image URL
        updated_at: new Date().toISOString()
      };

      // Notify listeners of the change
      this.notifyEventListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update event' };
    }
  }

  async publishEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }
      
      // Mock publish operation
      await new Promise(resolve => setTimeout(resolve, 300));

      const eventIndex = mockEvents.findIndex(event => event.id === eventId);
      if (eventIndex === -1) {
        return { success: false, error: 'Event not found' };
      }

      mockEvents[eventIndex] = {
        ...mockEvents[eventIndex],
        status: 'published',
        updated_at: new Date().toISOString()
      };

      // Notify listeners of the change
      this.notifyEventListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to publish event' };
    }
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock delete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const eventIndex = mockEvents.findIndex(event => event.id === eventId);
      if (eventIndex === -1) {
        return { success: false, error: 'Event not found' };
      }

      mockEvents.splice(eventIndex, 1);

      // Notify listeners of the change
      this.notifyEventListeners();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete event' };
    }
  }

  async getEventAnalytics(eventId: string): Promise<{ success: boolean; analytics?: OrganizerEventAnalytics; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock analytics
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockAnalytics: OrganizerEventAnalytics = {
        id: 'analytics_1',
        event_id: eventId,
        views: 1250,
        registrations: 85,
        conversion_rate: 6.8,
        revenue: 12750,
        top_referrers: ['Direct', 'Social Media', 'Email'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return { success: true, analytics: mockAnalytics };
    } catch (error) {
      return { success: false, error: 'Failed to fetch analytics' };
    }
  }

  async createTicketType(eventId: string, ticketData: TicketFormData): Promise<{ success: boolean; ticket?: OrganizerTicketType; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock ticket creation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newTicket: OrganizerTicketType = {
        id: `ticket_${Date.now()}`,
        event_id: eventId,
        ...ticketData,
        sold: 0,
        created_at: new Date().toISOString()
      };

      return { success: true, ticket: newTicket };
    } catch (error) {
      return { success: false, error: 'Failed to create ticket type' };
    }
  }

  async getTicketTypes(eventId: string): Promise<{ success: boolean; tickets?: OrganizerTicketType[]; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock ticket types
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockTickets: OrganizerTicketType[] = [
        {
          id: 'ticket_1',
          event_id: eventId,
          name: 'Early Bird',
          description: 'Limited time offer',
          price: 99,
          currency: 'USD',
          quantity: 100,
          sold: 25,
          sale_start: new Date().toISOString(),
          is_active: true,
          benefits: ['Early access'],
          restrictions: ['Non-refundable'],
          created_at: new Date().toISOString()
        }
      ];

      return { success: true, tickets: mockTickets };
    } catch (error) {
      return { success: false, error: 'Failed to fetch ticket types' };
    }
  }

  async updateTicketType(ticketId: string, updates: Partial<TicketFormData>): Promise<{ success: boolean; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock update
      await new Promise(resolve => setTimeout(resolve, 300));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update ticket type' };
    }
  }

  async deleteTicketType(ticketId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock delete
      await new Promise(resolve => setTimeout(resolve, 300));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete ticket type' };
    }
  }

  async getEventAttendees(eventId: string): Promise<{ success: boolean; attendees?: OrganizerAttendee[]; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock attendees
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockAttendees: OrganizerAttendee[] = [
        {
          id: 'attendee_1',
          event_id: eventId,
          user_id: 'user_1',
          registration_date: new Date().toISOString(),
          check_in_status: 'pending',
          payment_status: 'completed',
          additional_info: {},
          user: {
            full_name: 'John Doe',
            email: 'john@example.com'
          },
          ticket_type: {
            name: 'Early Bird',
            price: 99
          }
        }
      ];

      return { success: true, attendees: mockAttendees };
    } catch (error) {
      return { success: false, error: 'Failed to fetch attendees' };
    }
  }

  async updateAttendeeStatus(attendeeId: string, checkInStatus: 'pending' | 'checked-in' | 'no-show'): Promise<{ success: boolean; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock status update
      await new Promise(resolve => setTimeout(resolve, 200));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update attendee status' };
    }
  }

  async createMarketingCampaign(eventId: string, campaignData: Omit<MarketingCampaign, 'id' | 'event_id' | 'created_at' | 'open_rate' | 'click_rate'>): Promise<{ success: boolean; campaign?: MarketingCampaign; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock campaign creation
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const newCampaign: MarketingCampaign = {
        id: `campaign_${Date.now()}`,
        event_id: eventId,
        ...campaignData,
        open_rate: Math.random() * 30 + 10,
        click_rate: Math.random() * 10 + 2,
        created_at: new Date().toISOString()
      };

      return { success: true, campaign: newCampaign };
    } catch (error) {
      return { success: false, error: 'Failed to create campaign' };
    }
  }

  async getMarketingCampaigns(eventId: string): Promise<{ success: boolean; campaigns?: MarketingCampaign[]; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock campaigns
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockCampaigns: MarketingCampaign[] = [
        {
          id: 'campaign_1',
          event_id: eventId,
          name: 'Pre-Event Announcement',
          type: 'email',
          subject: 'Don\'t miss our event!',
          content: 'Join us for an amazing experience...',
          audience: 'all_subscribers',
          status: 'sent',
          open_rate: 24.5,
          click_rate: 8.2,
          created_at: new Date().toISOString()
        }
      ];

      return { success: true, campaigns: mockCampaigns };
    } catch (error) {
      return { success: false, error: 'Failed to fetch campaigns' };
    }
  }

  async updateMarketingCampaign(campaignId: string, updates: Partial<MarketingCampaign>): Promise<{ success: boolean; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock update
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update campaign' };
    }
  }

  async deleteMarketingCampaign(campaignId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock delete
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete campaign' };
    }
  }

  async deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check organizer access
      const accessCheck = await this.checkOrganizerAccess();
      if (!accessCheck.success) {
        return { success: false, error: accessCheck.error };
      }

      // Mock delete
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to delete event' };
    }
  }

  // Validate image file
  private validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Image size must be less than 5MB'
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image'
      };
    }

    return { isValid: true };
  }

  // Image upload using storage service
  async uploadImage(file: File, eventId?: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Import storage service dynamically to avoid circular dependencies
      const { storageService } = await import('./storageService');
      
      const result = await storageService.uploadEventImage(file, eventId);
      
      if (result.success) {
        return { success: true, url: result.url };
      } else {
        return { success: false, error: result.error || 'Upload failed' };
      }
    } catch (error) {
      console.error('Image upload error:', error);
      return { success: false, error: 'Failed to upload image' };
    }
  }
}

export const organizerCrudService = OrganizerCrudService.getInstance();