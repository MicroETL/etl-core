import { PubSub } from "@google-cloud/pubsub";
import {GCloudPubSubLogger} from "@adapters/logger";

describe("GCloudPubSubLogger", () => {
  const topic = (new PubSub()).topic("etl-event");
  const metadata = {"name": "test-logger"};
  const logger = new GCloudPubSubLogger(metadata, topic);

  test("log", () => {
    return logger.log({"event": "start"})
      .then(() => {
        expect(topic.publish).toBeCalledWith(expect.any(Buffer));
      });
  });

  test("timeit", () => {
    const data = {"some": "value"};
    const func = jest.fn();
    func.mockResolvedValue(true);
    return logger.timeit(null, func, data)
      .then(() => {
        expect(func).toBeCalledWith(data);
        expect(topic.publish).toBeCalledWith(expect.any(Buffer));
      });
  });

});
