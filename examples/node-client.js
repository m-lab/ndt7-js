/* eslint-env es6, node */

'use strict';

// People who have this installed as a module (pretty much everyone who is
// reading this) should change this line to:
// const ndt7 = require('ndt7');
const ndt7 = require('../src/ndt7.js');

ndt7.test(
    {
      userAcceptedDataPolicy: true,
    },
    {
      serverChosen: function(server) {
        console.log('Testing to:', {
          machine: server.machine,
          locations: server.location,
        });
      },
      downloadComplete: function(data) {
        // (bytes / second) * (bits / byte) * (megabits / bit) = Mbps
        serverBw = data.LastServerMeasurement.BBRInfo.BW * 8 / 1000000;
        clientBw = data.LastClientMeasurement.MeanClientMbps;
        console.log(
            `Download test is complete:
              Instantaneous server bandwidth: ${serverBw}
              Mean client bandwidth: ${clientBw}`);
      },
      uploadComplete: function(data) {
        console.log(
            `Upload test is complete:
              Mean server bandwidth: ${data.LastServerMeasurement}
              Mean client bandwidth: ${data.LastClientMeasurement}`);
      },
    },
).then((exitcode) => {
  process.exit(exitcode);
});
