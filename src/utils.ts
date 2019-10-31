import cryptoRandomString from "crypto-random-string";

import {Message} from "@adapters/model";

export const generateRequestIdentifier = (): string =>
  `${new Date().toISOString()}-${cryptoRandomString({ length: 8 })}`;

export const cleanMessage = (data?: string): Message|null => {
  const msgStr = data
    ? Buffer.from(data, "base64").toString()
    : "none";

  if (msgStr == "none") {
    console.warn("Pubsub message did not contain file path.");
    return null;
  }

  const msg = JSON.parse(msgStr);

  return msg;
};
