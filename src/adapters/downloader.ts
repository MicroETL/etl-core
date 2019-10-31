import {Bucket} from "./model";

export interface Downloader {
  download(source: string): Promise<string>;
}

export class GCloudDownloader implements Downloader {
  bucket: Bucket

  constructor(bucket: Bucket) {
    this.bucket = bucket;
  }

  download(source: string): Promise<string> {
    const file = this.bucket.file(source);

    return file.download().then((data: Buffer[]): string => {
      return Buffer.from(data[0]).toString();
    });
  }
}
