const pubsub = jest.genMockFromModule("@google-cloud/pubsub");

export const publishMock = jest.fn();
publishMock.mockResolvedValue(true);
const topicMock = jest.fn(() => ({publish: publishMock}));

export const PubSub = jest.fn().mockImplementation(() => ({topic: topicMock}));

export default pubsub;
