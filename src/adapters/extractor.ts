import {Table, Record} from "./model";

export interface ExtractFunc {
  (data: any): Record[];
}

const getDefault = (v: any, d: any): any => v !== undefined ? v : d;

export class Extractor {
  name: string;
  path: string;
  extractFunc: ExtractFunc;

  constructor(name: string, path: string, extractFunc: ExtractFunc) {
    this.name = name;
    this.path = path;
    this.extractFunc = extractFunc;
  }

  extract(raw: string): Table[] {
    const parsed = JSON.parse(raw);
    const records = this.extractFunc(parsed).map((record: Record): Record => {
      return {
        ...record,
        sys_date: getDefault(record.sys_date, new Date()),
        sys_source: getDefault(record.sys_source, this.path),
        sys_active: getDefault(record.sys_active, true)
      };
    });

    return [{
      name: this.name,
      records
    }];
  }
}
