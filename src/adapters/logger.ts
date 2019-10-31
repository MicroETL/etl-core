import {Topic, LogEvent} from "./model";

export interface Logger {
  log(data: LogEvent): Promise<string|void>;
  timeit(data: LogEvent, func: Function, ...args: any[]): Promise<string|void>;
}

export class GCloudPubSubLogger implements Logger {
  metadata: object;
  topic: Topic;

  constructor(metadata: object, topic: Topic) {
    this.metadata = metadata;
    this.topic = topic;
  }

  async _publish(message: object) {
    return this.topic.publish(Buffer.from(JSON.stringify(message)));
  }

  async log(data: LogEvent) {
    return this._publish({
      datetime: new Date().toISOString(),
      ...this.metadata,
      ...data
    }).catch((error: Error): void => {
      console.warn(`send${data.event}Logging pubsub failed`, error);
    });
  }

  async timeit(data: LogEvent, func: Function, ...args: any[]) {
    const startTime = new Date();
    const result = await func(...args);
    const endTime = new Date();
    await this.log({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration: +endTime - +startTime,
      ...data
    });
    return result;
  }
}
