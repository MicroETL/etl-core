const {Storage} = require("@google-cloud/storage");
const {PubSub} = require("@google-cloud/pubsub");

import {Downloader, GCloudDownloader} from "@adapters/downloader";
import {Extractor, ExtractFunc} from "@adapters/extractor";
import {generateRequestIdentifier, cleanMessage} from "@/utils";
import {Logger, GCloudPubSubLogger} from "@adapters/logger";
import {Uploader, GCloudUploader} from "@adapters/uploader";
import {Table, Bucket, Topic} from "@adapters/model";

export interface GCloudConfig {
  datalake: string;
  staging: string;
  topic: string;
  service: string;
  method: string;
  table: string;
}

export abstract class BaseTransformer {
  abstract downloader: Downloader;
  abstract uploader: Uploader;
  abstract extractFunc: ExtractFunc;
  abstract getExtractor(filePath: string): Extractor;
  abstract getLogger(filePath: string): Logger;

  extractRecords(extractFunc: ExtractFunc) {
    this.extractFunc = extractFunc
  }

  async handler(pubSubEvent: any, context?: any) {
    if (!this.extractFunc) throw "Please set extractRecords";

    const msg = cleanMessage(pubSubEvent.data);
    if (!msg) return 1;

    return this.transform(msg.source);
  }

  async transform(sourceFile: string) {
    const logger = this.getLogger(sourceFile);
    const extractor = this.getExtractor(sourceFile);
    await logger.log({event: "start"});

    const payload = await this.downloader.download(sourceFile);
    const tables = await extractor.extract(payload);

    const allUploads = tables.map(
      async (table: Table) => {
        if (table.records.length < 1) {
          console.log(`No records for table ${table.name}`);
          return false;
        }

        const filename = `${table.name}/${sourceFile.split("/")[1]}.json`;
        return logger.timeit(
          {event: "end", target: filename},
          this.uploader.upload,
          table.records,
          filename
        );
      }
    );

    return Promise.all(allUploads);
  }
}

export class GCloudPubSubTransformer extends BaseTransformer {
  config: GCloudConfig;
  downloader: Downloader;
  uploader: Uploader;
  extractFunc: ExtractFunc;
  topic: Topic;

  constructor(config: GCloudConfig) {
    super();

    const pubsub = new PubSub();
    const storage = new Storage();
    const datalakeBucket = storage.bucket(config.datalake);
    const stagingBucket = storage.bucket(config.staging);
    const topic = pubsub.topic(config.topic);

    this.config = config;
    this.downloader = new GCloudDownloader(datalakeBucket);
    this.uploader = new GCloudUploader(stagingBucket);
    this.topic = topic;
    this.transform = this.transform.bind(this);
    this.handler = this.handler.bind(this);
  }

  get name(): string {
    const { service, method } = this.config;
    return `etl-transformer-${service}-${method}`;
  }

  getExtractor(filePath: string): Extractor {
    const {table} = this.config;
    return new Extractor(table, filePath, this.extractFunc);
  }

  getLogger(filePath: string): Logger {
    const {service, method} = this.config;
    const identifier = generateRequestIdentifier();
    const source = `${service}/${method}`;

    return new GCloudPubSubLogger({
      service: "etl-transformer",
      sourceFile: filePath,
      identifier,
      source,
    }, this.topic);
  }
}
