const { Transform } = require("stream");
const { TokenBucket } = require("limiter");

module.exports = {
  /*
    options:
      rateBytes (number, required)
      chunkSizeBytes (number, optional)
  */
  getThrottledStream: function (options) {
    function throwErrorIfInvalid(options) {
      if (!options) throw new Error("throttle options required");
      if (!options.rateBytes || typeof options.rateBytes !== "number" || options.rateBytes <= 0)
        throw new Error("throttle rate must be a positive number");
      if (options.chunkSizeBytes && (typeof options.chunkSizeBytes !== "number" || options.chunkSizeBytes <= 0))
        throw new Error("throttle chunk size must be a positive number");
    }

    throwErrorIfInvalid(options);

    function getSpeedVars(options) {
      return [
        options.chunkSizeBytes || Math.round(options.rateBytes / 10) || 1,
        new TokenBucket(options.rateBytes, options.rateBytes, "second", null),
      ];
    }

    var [chunkSizeBytes, bucket] = getSpeedVars(options);

    function transform(chunk, encoding, done, pos = 0) {
      var slice = chunk.slice(pos, pos + chunkSizeBytes);
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
        transform(chunk, encoding, done, pos + chunkSizeBytes);
      });
    }

    var throttleTransform = new Transform({ transform });

    throttleTransform.updateThrottleOptions = function (newOptions) {
      throwErrorIfInvalid(newOptions);
      [chunkSizeBytes, bucket] = getSpeedVars(newOptions);
    };

    return throttleTransform;
  },
};
