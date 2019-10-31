import * as stream from "stream";
const Writable = stream.Writable;

const memStore: {[key: string]: Buffer} = {};

/* Writable memory stream */
class WMStrm extends Writable {
  key: string;

  constructor(key: string, options?: object) {
    super(options);
    this.key = key; // save key
    memStore[key] = Buffer.from(""); // empty
  }

  _write(chunk: Buffer | string, enc: BufferEncoding, cb: Function) {
    // our memory store stores things in buffers
    const buffer = (Buffer.isBuffer(chunk)) ?
      chunk :  // already is Buffer use it
      new Buffer(chunk, enc);  // string, convert

    // concat to the buffer already there
    memStore[this.key] = Buffer.concat([memStore[this.key], buffer]);
    cb();
  }
}

export default WMStrm;
