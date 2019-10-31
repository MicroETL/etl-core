import {Downloader, GCloudDownloader} from "@adapters/downloader";
import {Extractor, ExtractFunc} from "@adapters/extractor";
import {generateRequestIdentifier, cleanMessage} from "@/utils";
import {Logger, GCloudPubSubLogger} from "@adapters/logger";
import {Uploader, GCloudUploader} from "@adapters/uploader";
import {Table, Bucket, Topic} from "@adapters/model";

export interface GCloudConfig {
  extractBucket: Bucket;
  stagingBucket: Bucket;
  topic: Topic;
  service: string;
  method: string;
  extractRecords: ExtractFunc;
}

export abstract class BaseTransformer {
  abstract downloader: Downloader;
  abstract uploader: Uploader;
  abstract getExtractor(filePath: string): Extractor;
  abstract getLogger(filePath: string): Logger;

  async transform(pubSubEvent: any, context?: any) {
    const msg = cleanMessage(pubSubEvent.data);
    if (!msg) return 1;

    const sourceFile = msg.source;
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

  constructor(config: GCloudConfig) {
    super();
    this.config = config;
    this.downloader = new GCloudDownloader(this.config.extractBucket);
    this.uploader = new GCloudUploader(this.config.stagingBucket);
    this.transform = this.transform.bind(this);
  }

  getExtractor(filePath: string): Extractor {
    const {service, method} = this.config;
    return new Extractor(`${service}_${method}`, filePath, this.config.extractRecords);
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
    }, this.config.topic);
  }
}
