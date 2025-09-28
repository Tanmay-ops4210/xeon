import { supabase } from '../lib/supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Event, EventListResponse } from '../types/eventManagement';

export interface RealtimeEventUpdate {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'events' | 'ticket_types' | 'speakers' | 'schedule_items';
  record: any;
  old_record?: any;
}

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

/**
 * Realtime Service for EventEase
 * Handles real-time updates using Supabase Realtime
 */
export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();

  /**
   * Subscribe to published events updates
   */
  subscribeToPublishedEvents(
    onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void
  ): RealtimeSubscription {
    const channelName = 'published-events';
    
    // Clean up existing channel if it exists
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: 'status=eq.published'
        },
        onUpdate
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      }
    };
  }

  /**
   * Subscribe to organizer's events updates
   */
  subscribeToOrganizerEvents(
    organizerId: string,
    onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void
  ): RealtimeSubscription {
    const channelName = `organizer-events-${organizerId}`;
    
    // Clean up existing channel if it exists
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `organizer_id=eq.${organizerId}`
        },
        onUpdate
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      }
    };
  }

  /**
   * Subscribe to specific event updates
   */
  subscribeToEvent(
    eventId: string,
    onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void
  ): RealtimeSubscription {
    const channelName = `event-${eventId}`;
    
    // Clean up existing channel if it exists
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'events',
          filter: `id=eq.${eventId}`
        },
        onUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_types',
          filter: `event_id=eq.${eventId}`
        },
        onUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'speakers',
          filter: `event_id=eq.${eventId}`
        },
        onUpdate
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'schedule_items',
          filter: `event_id=eq.${eventId}`
        },
        onUpdate
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      }
    };
  }

  /**
   * Subscribe to event registrations updates
   */
  subscribeToEventRegistrations(
    eventId: string,
    onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void
  ): RealtimeSubscription {
    const channelName = `event-registrations-${eventId}`;
    
    // Clean up existing channel if it exists
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations',
          filter: `event_id=eq.${eventId}`
        },
        onUpdate
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      }
    };
  }

  /**
   * Subscribe to user notifications
   */
  subscribeToNotifications(
    userId: string,
    onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void
  ): RealtimeSubscription {
    const channelName = `notifications-${userId}`;
    
    // Clean up existing channel if it exists
    if (this.channels.has(channelName)) {
      this.channels.get(channelName)?.unsubscribe();
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        onUpdate
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.channels.delete(channelName);
      }
    };
  }

  /**
   * Broadcast event update to all subscribers
   */
  async broadcastEventUpdate(eventId: string, update: Partial<Event>): Promise<void> {
    try {
      const channel = supabase.channel(`event-broadcast-${eventId}`);
      
      await channel.send({
        type: 'broadcast',
        event: 'event_update',
        payload: {
          eventId,
          update,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to broadcast event update:', error);
    }
  }

  /**
   * Broadcast new event to all published events subscribers
   */
  async broadcastNewEvent(event: Event): Promise<void> {
    try {
      const channel = supabase.channel('published-events-broadcast');
      
      await channel.send({
        type: 'broadcast',
        event: 'new_event',
        payload: {
          event,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to broadcast new event:', error);
    }
  }

  /**
   * Broadcast event registration update
   */
  async broadcastRegistrationUpdate(
    eventId: string, 
    registration: any
  ): Promise<void> {
    try {
      const channel = supabase.channel(`event-registrations-broadcast-${eventId}`);
      
      await channel.send({
        type: 'broadcast',
        event: 'registration_update',
        payload: {
          eventId,
          registration,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to broadcast registration update:', error);
    }
  }

  /**
   * Send notification to user
   */
  async sendNotification(
    userId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      data?: any;
    }
  ): Promise<void> {
    try {
      // Insert notification into database
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          is_read: false
        });

      if (error) {
        console.error('Failed to send notification:', error);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });
    this.channels.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'CONNECTED' | 'DISCONNECTED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED' {
    // This would need to be implemented based on Supabase client status
    // For now, return a basic status
    return 'CONNECTED';
  }
}

// Create singleton instance
export const realtimeService = new RealtimeService();

// Export convenience functions
export const subscribeToPublishedEvents = (onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void) => 
  realtimeService.subscribeToPublishedEvents(onUpdate);

export const subscribeToOrganizerEvents = (organizerId: string, onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void) => 
  realtimeService.subscribeToOrganizerEvents(organizerId, onUpdate);

export const subscribeToEvent = (eventId: string, onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void) => 
  realtimeService.subscribeToEvent(eventId, onUpdate);

export const subscribeToEventRegistrations = (eventId: string, onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void) => 
  realtimeService.subscribeToEventRegistrations(eventId, onUpdate);

export const subscribeToNotifications = (userId: string, onUpdate: (payload: RealtimePostgresChangesPayload<any>) => void) => 
  realtimeService.subscribeToNotifications(userId, onUpdate);

export const broadcastEventUpdate = (eventId: string, update: Partial<Event>) => 
  realtimeService.broadcastEventUpdate(eventId, update);

export const broadcastNewEvent = (event: Event) => 
  realtimeService.broadcastNewEvent(event);

export const broadcastRegistrationUpdate = (eventId: string, registration: any) => 
  realtimeService.broadcastRegistrationUpdate(eventId, registration);

export const sendNotification = (userId: string, notification: { type: string; title: string; message: string; data?: any }) => 
  realtimeService.sendNotification(userId, notification);

export default realtimeService;

