import {Storage} from "@google-cloud/storage";

import {GCloudDownloader} from "@adapters/downloader";

describe("GCloudDownloader", () => {
  const bucket = (new Storage()).bucket("staging-bucket");

  test("test download file to string", () => {
    const sourceFile = "path/to/file";
    const downloader = new GCloudDownloader(bucket);

    return downloader.download(sourceFile).then(raw => {
      expect(bucket.file).toBeCalledWith(sourceFile);
      expect(raw).toBe("{\"key\": \"value\"}\n");
    });
  });
});
