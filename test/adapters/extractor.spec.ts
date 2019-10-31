import {Extractor} from "@adapters/extractor";
import {Record} from "@adapters/model";

describe("Extractor", () => {
  const tableName = "slack_users";
  const path = "path/to/file";
  const extractRecords = (data: any): Record[] => data.foo;
  const extractor = new Extractor(tableName, path, extractRecords);

  test("return tables", () => {
    const tables = extractor.extract('{"foo": [{"bar": "baz", "sys_date": "1-1-2011"}]}');
    expect(tables.length).toBe(1);
    const table = tables[0];
    expect(table.name).toBe(tableName);
    expect(table.records.length).toBe(1);
    const record = table.records[0];
    expect(record.bar).toBe("baz");
    expect(record.sys_date).toBe("1-1-2011");
    expect(record.sys_source).toBe(path);
    expect(record.sys_active).toBeTruthy();
  });
});
