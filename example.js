const Throttle = require("./index");
const { Readable } = require("stream");

// create simple readable stream
const readableStream = new Readable({
  read() {
    this.push("hello!");
  },
});

//create a stream which throttles output to 1 byte per second
const throttledStream = Throttle.getThrottledStream({ rateBytes: 1 });

//pipe readableStream to throttledStream, then stdout
readableStream.pipe(throttledStream).pipe(process.stdout);

//increase rate after 10 seconds
setTimeout(() => {
  throttledStream.updateThrottleOptions({ rateBytes: 10 });
}, 10 * 1000);
