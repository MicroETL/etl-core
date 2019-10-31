import {Storage} from "@google-cloud/storage";

import {GCloudUploader} from "@adapters/uploader";

describe("GCloudUploader", () => {
  const path = "path/to/file";
  const bucket = (new Storage()).bucket("staging-bucket");
  const uploader = new GCloudUploader(bucket);

  test("upload to bucket success", () => {
    return uploader.upload([{key: "value"}], path).then(res => {
      expect(res).toBeTruthy();
    });
  });

  test("transform record success", () => {
    const res = uploader.transformRow({sys_key: "value"});
    expect(typeof res).toBe("string");
  });

  test("transform record failed", () => {
    expect(uploader.transformRow({})).toEqual(expect.any(Error));
  });
});
