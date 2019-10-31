import * as stream from "stream";

export interface Record {
  [key: string]: any;
}

export interface Table {
  name: string;
  records: Record[];
}

export interface Message {
    source: string;
}

export interface LogEvent {
    event: string;
    [key: string]: any;
}

export interface Topic {
    publish(buffer: Buffer): Promise<string|void>;
}

export interface File {
    download(): Promise<Buffer[]>;
    createWriteStream(options: any): stream.Writable;
}

export interface Bucket {
    file(name: string): File;
}
