import { supabase } from '../lib/supabase';

export interface PublicEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  category: string;
  price: number;
  imageUrl?: string;
  venueName?: string;
  venueAddress?: string;
  isOnline: boolean;
  onlineLink?: string;
  maxAttendees?: number;
  speakers: {
    id: string;
    name: string;
    title: string;
    company: string;
    imageUrl?: string;
  }[];
  sponsors: {
    id: string;
    name: string;
    logoUrl: string;
    tier: string;
  }[];
}

export interface PublicEventListResponse {
  events: PublicEvent[];
  hasMore: boolean;
  total: number;
  page: number;
  limit: number;
}

class PublicEventService {
  private static instance: PublicEventService;

  static getInstance(): PublicEventService {
    if (!PublicEventService.instance) {
      PublicEventService.instance = new PublicEventService();
    }
    return PublicEventService.instance;
  }

  /**
   * Get published events for public viewing
   */
  async getPublicEvents(
    page: number = 1, 
    limit: number = 9, 
    category?: string,
    sortBy: 'date' | 'title' | 'price' = 'date'
  ): Promise<PublicEventListResponse> {
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          event_speakers(
            speakers(
              id,
              name,
              title,
              company,
              image_url
            )
          ),
          event_sponsors(
            sponsors(
              id,
              name,
              logo_url,
              tier
            )
          )
        `)
        .eq('status', 'published')
        .order('start_date', { ascending: true });

      // Apply category filter if specified
      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      // Apply sorting
      switch (sortBy) {
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'price':
          query = query.order('price', { ascending: true });
          break;
        case 'date':
        default:
          query = query.order('start_date', { ascending: true });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching public events:', error);
        return {
          events: [],
          hasMore: false,
          total: 0,
          page,
          limit
        };
      }

      if (!data || data.length === 0) {
        return {
          events: [],
          hasMore: false,
          total: 0,
          page,
          limit
        };
      }

      // Transform database events to match PublicEvent type
      const events: PublicEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        category: event.category,
        price: event.price,
        imageUrl: event.image_url,
        venueName: event.venue_name,
        venueAddress: event.venue_address,
        isOnline: event.is_online,
        onlineLink: event.online_link,
        maxAttendees: event.max_attendees,
        speakers: event.event_speakers?.map((es: any) => ({
          id: es.speakers.id,
          name: es.speakers.name,
          title: es.speakers.title,
          company: es.speakers.company,
          imageUrl: es.speakers.image_url
        })) || [],
        sponsors: event.event_sponsors?.map((es: any) => ({
          id: es.sponsors.id,
          name: es.sponsors.name,
          logoUrl: es.sponsors.logo_url,
          tier: es.sponsors.tier
        })) || []
      }));

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedEvents = events.slice(startIndex, endIndex);

      return {
        events: paginatedEvents,
        hasMore: endIndex < events.length,
        total: events.length,
        page,
        limit
      };
    } catch (error) {
      console.error('Error fetching public events:', error);
      return {
        events: [],
        hasMore: false,
        total: 0,
        page,
        limit
      };
    }
  }

  /**
   * Get a single public event by ID
   */
  async getPublicEventById(id: string): Promise<PublicEvent | null> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_speakers(
            speakers(
              id,
              name,
              title,
              company,
              image_url
            )
          ),
          event_sponsors(
            sponsors(
              id,
              name,
              logo_url,
              tier
            )
          )
        `)
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error || !data) {
        console.error('Error fetching public event:', error);
        return null;
      }

      // Transform database event to match PublicEvent type
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        startDate: data.start_date,
        endDate: data.end_date,
        location: data.location,
        category: data.category,
        price: data.price,
        imageUrl: data.image_url,
        venueName: data.venue_name,
        venueAddress: data.venue_address,
        isOnline: data.is_online,
        onlineLink: data.online_link,
        maxAttendees: data.max_attendees,
        speakers: data.event_speakers?.map((es: any) => ({
          id: es.speakers.id,
          name: es.speakers.name,
          title: es.speakers.title,
          company: es.speakers.company,
          imageUrl: es.speakers.image_url
        })) || [],
        sponsors: data.event_sponsors?.map((es: any) => ({
          id: es.sponsors.id,
          name: es.sponsors.name,
          logoUrl: es.sponsors.logo_url,
          tier: es.sponsors.tier
        })) || []
      };
    } catch (error) {
      console.error('Error fetching public event:', error);
      return null;
    }
  }

  /**
   * Get featured events (events with speakers or sponsors)
   */
  async getFeaturedEvents(limit: number = 6): Promise<PublicEvent[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_speakers(
            speakers(
              id,
              name,
              title,
              company,
              image_url
            )
          ),
          event_sponsors(
            sponsors(
              id,
              name,
              logo_url,
              tier
            )
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error || !data) {
        console.error('Error fetching featured events:', error);
        return [];
      }

      // Transform database events to match PublicEvent type
      return data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        category: event.category,
        price: event.price,
        imageUrl: event.image_url,
        venueName: event.venue_name,
        venueAddress: event.venue_address,
        isOnline: event.is_online,
        onlineLink: event.online_link,
        maxAttendees: event.max_attendees,
        speakers: event.event_speakers?.map((es: any) => ({
          id: es.speakers.id,
          name: es.speakers.name,
          title: es.speakers.title,
          company: es.speakers.company,
          imageUrl: es.speakers.image_url
        })) || [],
        sponsors: event.event_sponsors?.map((es: any) => ({
          id: es.sponsors.id,
          name: es.sponsors.name,
          logoUrl: es.sponsors.logo_url,
          tier: es.sponsors.tier
        })) || []
      }));
    } catch (error) {
      console.error('Error fetching featured events:', error);
      return [];
    }
  }

  /**
   * Search events by title or description
   */
  async searchEvents(query: string, limit: number = 10): Promise<PublicEvent[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_speakers(
            speakers(
              id,
              name,
              title,
              company,
              image_url
            )
          ),
          event_sponsors(
            sponsors(
              id,
              name,
              logo_url,
              tier
            )
          )
        `)
        .eq('status', 'published')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error || !data) {
        console.error('Error searching events:', error);
        return [];
      }

      // Transform database events to match PublicEvent type
      return data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        category: event.category,
        price: event.price,
        imageUrl: event.image_url,
        venueName: event.venue_name,
        venueAddress: event.venue_address,
        isOnline: event.is_online,
        onlineLink: event.online_link,
        maxAttendees: event.max_attendees,
        speakers: event.event_speakers?.map((es: any) => ({
          id: es.speakers.id,
          name: es.speakers.name,
          title: es.speakers.title,
          company: es.speakers.company,
          imageUrl: es.speakers.image_url
        })) || [],
        sponsors: event.event_sponsors?.map((es: any) => ({
          id: es.sponsors.id,
          name: es.sponsors.name,
          logoUrl: es.sponsors.logo_url,
          tier: es.sponsors.tier
        })) || []
      }));
    } catch (error) {
      console.error('Error searching events:', error);
      return [];
    }
  }

  /**
   * Get upcoming events (events starting in the future)
   */
  async getUpcomingEvents(limit: number = 6): Promise<PublicEvent[]> {
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_speakers(
            speakers(
              id,
              name,
              title,
              company,
              image_url
            )
          ),
          event_sponsors(
            sponsors(
              id,
              name,
              logo_url,
              tier
            )
          )
        `)
        .eq('status', 'published')
        .gte('start_date', now)
        .order('start_date', { ascending: true })
        .limit(limit);

      if (error || !data) {
        console.error('Error fetching upcoming events:', error);
        return [];
      }

      // Transform database events to match PublicEvent type
      return data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.start_date,
        endDate: event.end_date,
        location: event.location,
        category: event.category,
        price: event.price,
        imageUrl: event.image_url,
        venueName: event.venue_name,
        venueAddress: event.venue_address,
        isOnline: event.is_online,
        onlineLink: event.online_link,
        maxAttendees: event.max_attendees,
        speakers: event.event_speakers?.map((es: any) => ({
          id: es.speakers.id,
          name: es.speakers.name,
          title: es.speakers.title,
          company: es.speakers.company,
          imageUrl: es.speakers.image_url
        })) || [],
        sponsors: event.event_sponsors?.map((es: any) => ({
          id: es.sponsors.id,
          name: es.sponsors.name,
          logoUrl: es.sponsors.logo_url,
          tier: es.sponsors.tier
        })) || []
      }));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      return [];
    }
  }
}

export const publicEventService = PublicEventService.getInstance();





