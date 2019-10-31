import {generateRequestIdentifier, cleanMessage} from "@/utils";

describe("utils", () => {
  test("generage unique identifier", () => {
    expect(generateRequestIdentifier()).not.toBe(generateRequestIdentifier());
  });

  test("clean message", () => {
    expect(cleanMessage("eyJzb3VyY2UiOiAiYWJjL3NhbXBsZS0xIn0="))
      .toStrictEqual({"source": "abc/sample-1"});
  });

  test("clean message failed", () => {
    expect(cleanMessage()).toBeNull();
  });
});
