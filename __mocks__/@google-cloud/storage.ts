import * as fs from "fs";
import WMStrm from "../helpers/wmstream";

const storage = jest.genMockFromModule("@google-cloud/storage");

const downloadMock = jest.fn();
downloadMock.mockResolvedValue([fs.readFileSync("fixtures/sample.json", "utf-8")]);

const createWriteStreamMock = jest.fn(() => {
  return new WMStrm("mock-wm-stream");
});
const fileMock = jest.fn(() => ({download: downloadMock, createWriteStream: createWriteStreamMock}));
const bucketMock = jest.fn(() => ({file: fileMock}));

export const Storage = jest.fn().mockImplementation(() => ({bucket: bucketMock}));

export default storage;
