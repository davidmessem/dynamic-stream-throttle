# Dynamic Stream Throttle

Dynamically limit the speed of a Node stream\
Adapted from [node-stream-throttle](https://github.com/tjgq/node-stream-throttle)

## Usage
Installation `npm i dynamic-stream-throttle`

`getThrottledStream` takes an object with rate parameters and returns a modified `stream.Transform` object   
The returned `Transform` has an `updateThrottleOptions` function to change the rate of throttling.
    
Throttle rate parameters
  - `rateBytes` throttle the stream speed to a number of bytes per second
  - `chunkSizeBytes` control the chunk size that is processed by the stream at each read

## Example
```javascript
const Throttle = require("dynamic-stream-throttle");
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
```
