import { GameEvent, EventListener } from '../types/index.js';

/**
 * Listener registration with priority
 */
interface ListenerRegistration<T = any> {
  listener: EventListener<T>;
  priority: number;
  once: boolean;
}

/**
 * Event bus for pub/sub event-driven architecture
 * 
 * Supports:
 * - Priority-ordered listeners (higher priority = called first)
 * - Event modification (listeners can return modified event)
 * - Event cancellation
 * - One-time listeners
 * - Event history tracking
 */
export class EventBus {
  private listeners: Map<string, ListenerRegistration[]> = new Map();
  private history: GameEvent[] = [];
  private historyLimit: number = 1000;
  private eventCounter: number = 0;

  /**
   * Register an event listener
   * @param eventType - Event type to listen for
   * @param listener - Callback function
   * @param priority - Priority (higher = called first, default 0)
   */
  on<T = any>(
    eventType: string,
    listener: EventListener<T>,
    priority: number = 0
  ): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const registrations = this.listeners.get(eventType)!;
    registrations.push({ listener, priority, once: false });

    // Sort by priority (descending)
    registrations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Register a one-time event listener (auto-removes after first call)
   * @param eventType - Event type to listen for
   * @param listener - Callback function
   * @param priority - Priority (higher = called first, default 0)
   */
  once<T = any>(
    eventType: string,
    listener: EventListener<T>,
    priority: number = 0
  ): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }

    const registrations = this.listeners.get(eventType)!;
    registrations.push({ listener, priority, once: true });

    // Sort by priority (descending)
    registrations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Remove a specific listener
   * @param eventType - Event type
   * @param listener - Listener to remove
   */
  off<T = any>(eventType: string, listener: EventListener<T>): void {
    const registrations = this.listeners.get(eventType);
    if (!registrations) return;

    const index = registrations.findIndex((reg) => reg.listener === listener);
    if (index !== -1) {
      registrations.splice(index, 1);
    }

    // Clean up empty arrays
    if (registrations.length === 0) {
      this.listeners.delete(eventType);
    }
  }

  /**
   * Remove all listeners for an event type
   * @param eventType - Event type to clear
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emit an event to all listeners
   * @param eventType - Event type
   * @param data - Event data
   * @returns Final event state after all listeners have processed it
   */
  emit<T = any>(eventType: string, data: T): GameEvent<T> {
    let event: GameEvent<T> = {
      type: eventType,
      timestamp: this.eventCounter++,
      data,
      cancelled: false,
    };

    // Get listeners for this event type
    const registrations = this.listeners.get(eventType);
    if (!registrations) {
      // No listeners, just record and return
      this.recordEvent(event);
      return event;
    }

    // Create a copy to iterate (in case listeners modify the array)
    const listenersToCall = [...registrations];

    // Process each listener in priority order
    const toRemove: ListenerRegistration[] = [];

    for (const registration of listenersToCall) {
      // Skip if event was cancelled by previous listener
      if (event.cancelled) {
        break;
      }

      try {
        const result = registration.listener(event);

        // If listener returns a modified event, use it
        if (result) {
          event = result;
        }

        // Mark for removal if this was a one-time listener
        if (registration.once) {
          toRemove.push(registration);
        }
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    }

    // Remove one-time listeners
    if (toRemove.length > 0) {
      const remaining = this.listeners.get(eventType)!;
      for (const reg of toRemove) {
        const index = remaining.indexOf(reg);
        if (index !== -1) {
          remaining.splice(index, 1);
        }
      }
    }

    // Record in history
    this.recordEvent(event);

    return event;
  }

  /**
   * Record event in history (limited size)
   */
  private recordEvent<T>(event: GameEvent<T>): void {
    this.history.push(event);

    // Trim history if it exceeds limit
    if (this.history.length > this.historyLimit) {
      this.history.shift();
    }
  }

  /**
   * Get event history
   * @param eventType - Optional filter by event type
   * @returns Array of events
   */
  getHistory(eventType?: string): GameEvent[] {
    if (eventType) {
      return this.history.filter((event) => event.type === eventType);
    }
    return [...this.history];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * Set history limit (max events to retain)
   * @param limit - Maximum number of events to keep
   */
  setHistoryLimit(limit: number): void {
    this.historyLimit = Math.max(0, limit);

    // Trim current history if needed
    while (this.history.length > this.historyLimit) {
      this.history.shift();
    }
  }

  /**
   * Get number of listeners for an event type
   * @param eventType - Event type
   * @returns Number of listeners
   */
  listenerCount(eventType: string): number {
    const registrations = this.listeners.get(eventType);
    return registrations ? registrations.length : 0;
  }

  /**
   * Check if there are any listeners for an event type
   * @param eventType - Event type
   * @returns true if there are listeners
   */
  hasListeners(eventType: string): boolean {
    return this.listenerCount(eventType) > 0;
  }

  /**
   * Reset the event bus (clear listeners and history)
   */
  reset(): void {
    this.listeners.clear();
    this.history = [];
    this.eventCounter = 0;
  }
}
