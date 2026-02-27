import { expect } from 'chai';
import { EventBus } from '../../src/events/EventBus.js';

describe('EventBus', () => {
  let eventBus: EventBus;

  beforeEach(() => {
    eventBus = new EventBus();
  });

  describe('on() and emit()', () => {
    it('should register and call listener', () => {
      let called = false;
      
      eventBus.on('test', () => {
        called = true;
      });
      
      eventBus.emit('test', {});
      expect(called).to.be.true;
    });

    it('should pass event data to listener', () => {
      let receivedData: any;
      
      eventBus.on('test', (event) => {
        receivedData = event.data;
      });
      
      eventBus.emit('test', { value: 42 });
      expect(receivedData).to.deep.equal({ value: 42 });
    });

    it('should call multiple listeners', () => {
      const calls: number[] = [];
      
      eventBus.on('test', () => { calls.push(1); });
      eventBus.on('test', () => { calls.push(2); });
      eventBus.on('test', () => { calls.push(3); });
      
      eventBus.emit('test', {});
      expect(calls).to.have.lengthOf(3);
    });

    it('should not call listeners for different event types', () => {
      let called = false;
      
      eventBus.on('event1', () => {
        called = true;
      });
      
      eventBus.emit('event2', {});
      expect(called).to.be.false;
    });
  });

  describe('priority ordering', () => {
    it('should call higher priority listeners first', () => {
      const order: number[] = [];
      
      eventBus.on('test', () => { order.push(1); }, 0);
      eventBus.on('test', () => { order.push(2); }, 10);
      eventBus.on('test', () => { order.push(3); }, 5);
      
      eventBus.emit('test', {});
      expect(order).to.deep.equal([2, 3, 1]);
    });

    it('should default to priority 0', () => {
      const order: number[] = [];
      
      eventBus.on('test', () => { order.push(1); }, 10);
      eventBus.on('test', () => { order.push(2); }); // default 0
      
      eventBus.emit('test', {});
      expect(order).to.deep.equal([1, 2]);
    });

    it('should handle negative priorities', () => {
      const order: number[] = [];
      
      eventBus.on('test', () => { order.push(1); }, -10);
      eventBus.on('test', () => { order.push(2); }, 0);
      eventBus.on('test', () => { order.push(3); }, 10);
      
      eventBus.emit('test', {});
      expect(order).to.deep.equal([3, 2, 1]);
    });
  });

  describe('event modification', () => {
    it('should allow listener to modify event', () => {
      eventBus.on('test', (event) => {
        return {
          ...event,
          data: { ...event.data, modified: true },
        };
      });

      const result = eventBus.emit('test', { value: 42 });
      expect(result.data).to.have.property('modified', true);
      expect(result.data).to.have.property('value', 42);
    });

    it('should pass modified event to next listener', () => {
      let receivedValue: number | undefined;

      eventBus.on('test', (event) => {
        return {
          ...event,
          data: { value: event.data.value * 2 },
        };
      }, 10);

      eventBus.on('test', (event) => {
        receivedValue = event.data.value;
      }, 0);

      eventBus.emit('test', { value: 5 });
      expect(receivedValue).to.equal(10);
    });

    it('should chain multiple modifications', () => {
      eventBus.on('damage', (event) => {
        return {
          ...event,
          data: { damage: event.data.damage * 2 },
        };
      }, 10);

      eventBus.on('damage', (event) => {
        return {
          ...event,
          data: { damage: event.data.damage + 5 },
        };
      }, 5);

      const result = eventBus.emit('damage', { damage: 10 });
      expect(result.data.damage).to.equal(25); // 10 * 2 + 5
    });
  });

  describe('event cancellation', () => {
    it('should allow listener to cancel event', () => {
      let secondListenerCalled = false;

      eventBus.on('test', (event) => {
        return { ...event, cancelled: true };
      }, 10);

      eventBus.on('test', () => {
        secondListenerCalled = true;
      }, 0);

      const result = eventBus.emit('test', {});
      expect(result.cancelled).to.be.true;
      expect(secondListenerCalled).to.be.false;
    });

    it('should stop processing after cancellation', () => {
      const calls: number[] = [];

      eventBus.on('test', () => { calls.push(1); }, 20);
      eventBus.on('test', (event) => {
        calls.push(2);
        return { ...event, cancelled: true };
      }, 10);
      eventBus.on('test', () => { calls.push(3); }, 0);

      eventBus.emit('test', {});
      expect(calls).to.deep.equal([1, 2]); // 3 should not be called
    });
  });

  describe('once()', () => {
    it('should call listener only once', () => {
      let callCount = 0;

      eventBus.once('test', () => {
        callCount++;
      });

      eventBus.emit('test', {});
      eventBus.emit('test', {});
      eventBus.emit('test', {});

      expect(callCount).to.equal(1);
    });

    it('should respect priority with once', () => {
      const order: number[] = [];

      eventBus.once('test', () => { order.push(1); }, 10);
      eventBus.on('test', () => { order.push(2); }, 5);

      eventBus.emit('test', {});
      eventBus.emit('test', {});

      expect(order).to.deep.equal([1, 2, 2]); // once listener only called first time
    });
  });

  describe('off()', () => {
    it('should remove specific listener', () => {
      let callCount = 0;
      const listener = () => {
        callCount++;
      };

      eventBus.on('test', listener);
      eventBus.emit('test', {});
      expect(callCount).to.equal(1);

      eventBus.off('test', listener);
      eventBus.emit('test', {});
      expect(callCount).to.equal(1); // Not called again
    });

    it('should not affect other listeners', () => {
      let count1 = 0;
      let count2 = 0;
      const listener1 = () => { count1++; };
      const listener2 = () => { count2++; };

      eventBus.on('test', listener1);
      eventBus.on('test', listener2);

      eventBus.off('test', listener1);
      eventBus.emit('test', {});

      expect(count1).to.equal(0);
      expect(count2).to.equal(1);
    });
  });

  describe('removeAllListeners()', () => {
    it('should remove all listeners for event type', () => {
      let called = false;

      eventBus.on('test', () => {
        called = true;
      });
      eventBus.on('test', () => {
        called = true;
      });

      eventBus.removeAllListeners('test');
      eventBus.emit('test', {});

      expect(called).to.be.false;
    });

    it('should not affect other event types', () => {
      let test1Called = false;
      let test2Called = false;

      eventBus.on('test1', () => {
        test1Called = true;
      });
      eventBus.on('test2', () => {
        test2Called = true;
      });

      eventBus.removeAllListeners('test1');
      eventBus.emit('test1', {});
      eventBus.emit('test2', {});

      expect(test1Called).to.be.false;
      expect(test2Called).to.be.true;
    });

    it('should remove all listeners if no type specified', () => {
      let called = false;

      eventBus.on('test1', () => {
        called = true;
      });
      eventBus.on('test2', () => {
        called = true;
      });

      eventBus.removeAllListeners();
      eventBus.emit('test1', {});
      eventBus.emit('test2', {});

      expect(called).to.be.false;
    });
  });

  describe('history', () => {
    it('should record emitted events', () => {
      eventBus.emit('test1', { value: 1 });
      eventBus.emit('test2', { value: 2 });

      const history = eventBus.getHistory();
      expect(history).to.have.lengthOf(2);
      expect(history[0].type).to.equal('test1');
      expect(history[1].type).to.equal('test2');
    });

    it('should record events even with no listeners', () => {
      eventBus.emit('test', { value: 42 });

      const history = eventBus.getHistory();
      expect(history).to.have.lengthOf(1);
      expect(history[0].data).to.deep.equal({ value: 42 });
    });

    it('should filter history by event type', () => {
      eventBus.emit('test1', {});
      eventBus.emit('test2', {});
      eventBus.emit('test1', {});

      const history = eventBus.getHistory('test1');
      expect(history).to.have.lengthOf(2);
      expect(history.every((e) => e.type === 'test1')).to.be.true;
    });

    it('should limit history size', () => {
      eventBus.setHistoryLimit(5);

      for (let i = 0; i < 10; i++) {
        eventBus.emit('test', { value: i });
      }

      const history = eventBus.getHistory();
      expect(history).to.have.lengthOf(5);
      expect(history[0].data.value).to.equal(5); // First 5 were trimmed
    });

    it('should clear history', () => {
      eventBus.emit('test', {});
      eventBus.emit('test', {});

      eventBus.clearHistory();

      const history = eventBus.getHistory();
      expect(history).to.be.empty;
    });
  });

  describe('listenerCount() and hasListeners()', () => {
    it('should return listener count', () => {
      expect(eventBus.listenerCount('test')).to.equal(0);

      eventBus.on('test', () => {});
      expect(eventBus.listenerCount('test')).to.equal(1);

      eventBus.on('test', () => {});
      expect(eventBus.listenerCount('test')).to.equal(2);
    });

    it('should return hasListeners', () => {
      expect(eventBus.hasListeners('test')).to.be.false;

      eventBus.on('test', () => {});
      expect(eventBus.hasListeners('test')).to.be.true;
    });
  });

  describe('reset()', () => {
    it('should clear all listeners and history', () => {
      eventBus.on('test', () => {});
      eventBus.emit('test', {});

      eventBus.reset();

      expect(eventBus.hasListeners('test')).to.be.false;
      expect(eventBus.getHistory()).to.be.empty;
    });
  });

  describe('event structure', () => {
    it('should create proper event structure', () => {
      const result = eventBus.emit('test', { value: 42 });

      expect(result).to.have.property('type', 'test');
      expect(result).to.have.property('timestamp');
      expect(result).to.have.property('data');
      expect(result).to.have.property('cancelled', false);
      expect(result.data).to.deep.equal({ value: 42 });
    });

    it('should increment timestamps', () => {
      const event1 = eventBus.emit('test', {});
      const event2 = eventBus.emit('test', {});

      expect(event2.timestamp).to.be.greaterThan(event1.timestamp);
    });
  });

  describe('error handling', () => {
    it('should catch errors in listeners and continue', () => {
      const calls: number[] = [];

      eventBus.on('test', () => {
        calls.push(1);
        throw new Error('Test error');
      }, 10);

      eventBus.on('test', () => {
        calls.push(2);
      }, 0);

      // Should not throw
      expect(() => eventBus.emit('test', {})).to.not.throw();
      expect(calls).to.deep.equal([1, 2]); // Both called despite error
    });
  });

  describe('use case: damage calculation', () => {
    it('should allow multiple modifiers to damage', () => {
      // Simulate damage calculation pipeline
      eventBus.on('damage:calculated', (event) => {
        // Double damage on critical hit
        if (event.data.critical) {
          return {
            ...event,
            data: { ...event.data, damage: event.data.damage * 2 },
          };
        }
        return;
      }, 10);

      eventBus.on('damage:calculated', (event) => {
        // Apply damage reduction
        const reduction = event.data.target.defense * 0.5;
        return {
          ...event,
          data: { ...event.data, damage: Math.max(0, event.data.damage - reduction) },
        };
      }, 5);

      const result = eventBus.emit('damage:calculated', {
        damage: 50,
        critical: true,
        target: { defense: 20 },
      });

      expect(result.data.damage).to.equal(90); // (50 * 2) - (20 * 0.5)
    });

    it('should allow canceling damage (e.g., invulnerability)', () => {
      let damageApplied = false;

      // Check for invulnerability
      eventBus.on('damage:before_apply', (event) => {
        if (event.data.target.invulnerable) {
          return { ...event, cancelled: true };
        }
        return;
      }, 10);

      // Apply damage
      eventBus.on('damage:before_apply', () => {
        damageApplied = true;
      }, 0);

      eventBus.emit('damage:before_apply', {
        damage: 50,
        target: { invulnerable: true },
      });

      expect(damageApplied).to.be.false;
    });
  });
});
