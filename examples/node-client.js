/* eslint-env es6, node */

'use strict';

// People who have this installed as a module (pretty much everyone who is
// reading this) should change this line to:
// const ndt7 = require('@m-lab/ndt7');
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
        // (bytes/second) * (bits/byte) / (megabits/bit) = Mbps
        const serverBw = data.LastServerMeasurement.BBRInfo.BW * 8 / 1000000;
        const clientGoodput = data.LastClientMeasurement.MeanClientMbps;
        console.log(
            `Download test is complete:
    Instantaneous server bottleneck bandwidth estimate: ${serverBw} Mbps
    Mean client goodput: ${clientGoodput} Mbps`);
      },
      uploadComplete: function(data) {
        // TODO: used actual upload duration for rate calculation.
        // bytes * (bits/byte() * (megabits/bit) * (1/seconds) = Mbps
        const serverBw =
            data.LastServerMeasurement.TCPInfo.BytesReceived * 8 / 1000000 / 10;
        const clientGoodput = data.LastClientMeasurement.MeanClientMbps;
        console.log(
            `Upload test is complete:
    Mean server throughput: ${serverBw} Mbps
    Mean client goodput: ${clientGoodput} Mbps`);
      },
      error: function(err) {
        console.log('Error while running the test:', err.message);
      },
    },
).then((exitcode) => {
  process.exit(exitcode);
});
