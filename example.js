const Throttle = require("./index");
const { Readable } = require("stream");

// create simple readable stream
const readableStream = new Readable({
  read() {
    this.push("hello!");
  },
});

var bytesPerSecond = 1;

//create a stream which throttles output to 1 byte per second
const throttledStream = Throttle.getThrottledStream({ rateBytes: bytesPerSecond });

//pipe readableStream to throttledStream, then stdout
readableStream.pipe(throttledStream).pipe(process.stdout);

//increase rate every 5 seconds
setInterval(() => {
  throttledStream.updateThrottleOptions({ rateBytes: (bytesPerSecond *= 10) });
}, 5 * 1000);
