import {Storage} from "@google-cloud/storage";
import {PubSub} from "@google-cloud/pubsub";

import {GCloudPubSubTransformer} from "@usecases/transformer";

describe("GCloudPubSubTransformer", () => {
  const bucket = (new Storage()).bucket("read-write-bucket");
  const topic = (new PubSub()).topic("logger-toppic");
  const service = "slack";
  const method = "users";
  const table = `${service}_${method}`;
  const extractRecords = () => [{sys_key: 1}];
  const gcp = {
    datalakeBucket: "read-write-bucket",
    stagingBucket: "read-write-bucket",
    topic: "logger-toppic",
    service,
    method,
    table,
  };
  const transfomer = new GCloudPubSubTransformer(gcp);
  const file = bucket.file("sample-file");


  beforeEach(() => {
    (topic.publish as jest.Mock<Promise<any>>).mockClear();
    (file.download as jest.Mock<Promise<any>>).mockClear();
    (file.createWriteStream as jest.Mock<any>).mockClear();
  });

  test("get name", () => {
    expect(transfomer.name).toEqual(`etl-transformer-${service}-${method}`);
  });

  test("not set extractRecords", () => {
    transfomer.extractRecords(null);
    transfomer.handler({}).catch(err => {
      expect(err).toEqual("Please set extractRecords");
    });
  });

  test("allUploads", () => {
    transfomer.extractRecords(extractRecords);
    return transfomer.handler({data: "eyJzb3VyY2UiOiAiYWJjL3NhbXBsZS0xIn0="})
      .then((res) => {
        expect(res).toStrictEqual([true]);
        expect(topic.publish).toBeCalledTimes(2);
        expect(file.download).toBeCalledTimes(1);
        expect(file.createWriteStream).toBeCalledTimes(1);
      });
  });

  test("return 1", () => {
    transfomer.extractRecords(extractRecords);
    return transfomer.handler({})
      .then(res => {
        expect(res).toBe(1);
        expect(topic.publish).not.toBeCalled();
        expect(file.download).not.toBeCalled();
        expect(file.createWriteStream).not.toBeCalled();
      });
  });

});
