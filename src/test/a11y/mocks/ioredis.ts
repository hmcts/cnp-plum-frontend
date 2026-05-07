import { EventEmitter } from 'events';

class Redis extends EventEmitter {
  private store: Map<string, string> = new Map();

  constructor() {
    super();
    process.nextTick(() => {
      this.emit('connect');
      this.emit('ready');
    });
  }

  async get(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async set(key: string, value: string): Promise<'OK'> {
    this.store.set(key, value);
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    keys.forEach(k => this.store.delete(k));
    return keys.length;
  }

  async expire(): Promise<number> {
    return 1;
  }
}

module.exports = { Redis };
