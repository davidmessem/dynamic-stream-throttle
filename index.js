const { Transform } = require("stream");
const { TokenBucket } = require("limiter");

module.exports = {
  /*
    Docs here
  */
  getThrottledStream: function getThrottledStream(options) {
    function throwErrorIfInvalid(options) {
      const optionsProvided = !!options;
      const rateValid = options.rate && typeof options.rate === "number" && options.rate > 0;
      const chunkSizeValid = !options.chunkSize || (typeof options.chunkSize === "number" && options.chunkSize > 0);

      if (!optionsProvided) throw new Error("throttle options required");
      if (!rateValid) throw new Error("throttle rate must be a positive number");
      if (!chunkSizeValid) throw new Error("throttle chunk size must be a positive number");
    }

    function getChunkSize(options) {
      return options.chunkSize || options.rate / 10;
    }

    function getBucket(options) {
      return new TokenBucket(options.rate, options.rate, "second", null);
    }

    throwErrorIfInvalid(options);

    var chunkSize = getChunkSize(options);
    var bucket = getBucket(options);

    function updateThrottleOptions(newOptions) {
      chunkSize = getChunkSize(newOptions);
      bucket = getBucket(newOptions);
    }

    function transform(chunk, encoding, done, pos = 0) {
      var slice = chunk.slice(pos, pos + chunkSize);
      if (!slice.length) {
        // chunk fully consumed
        done();
        return;
      }
      bucket.removeTokens(slice.length, function (err) {
        if (err) {
          done(err);
          return;
        }
        throttleTransform.push(slice);
        transform(chunk, encoding, done, pos + chunkSize);
      });
    }

    var throttleTransform = new Transform({ transform });
    throttleTransform.updateThrottleOptions = updateThrottleOptions;

    return throttleTransform;
  },
};
