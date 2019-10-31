import * as stream from "stream";

import { Bucket, Record } from "./model";

export interface Uploader {
  transformRow(row: Record): string|Error;
  upload(rows: Record[], path: string): Promise<boolean|Error>;
}

export class GCloudUploader implements Uploader {
  bucket: Bucket;

  constructor(bucket: Bucket) {
    this.bucket = bucket;
    this.upload = this.upload.bind(this);
    this.transformRow = this.transformRow.bind(this);
  }

  transformRow(row: Record): string|Error {
    if (!row.sys_key)
      return new Error("Each row sent to the data warehouse requires a unique sys_key value.");

    Object.keys(row).forEach(
      key => row[key] == null && delete row[key]
    );

    return JSON.stringify(row);
  }

  upload(rows: Record[], path: string): Promise<boolean|Error> {
    const output = rows.map(this.transformRow).join("\n");
    const stagingFile = this.bucket.file(path);
    const dataStream = new stream.Readable();
    dataStream.push(output);
    dataStream.push(null);

    return new Promise((resolve, reject) => {
      dataStream
        .pipe(
          stagingFile.createWriteStream({
            resumable: false,
            validation: false,
            contentType: "auto",
          })
        )
        .on("error", (error: Error) => {
          reject(error);
        })
        .on("finish", () => {
          resolve(true);
        });
    });
  }
}
