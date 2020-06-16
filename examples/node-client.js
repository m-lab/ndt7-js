/* eslint-env es6, node */

'use strict';

// People who have this installed as a module (pretty much everyone who is
// reading this) should change this line to:
// const ndt7 = require('ndt7');
const ndt7 = require('../src/ndt7.js');

ndt7.Test(
  {
    userAcceptedDataPolicy: true,
  },
  {
    serverChosen: function(server) {
      console.log("Testing to:", {
        machine: server.machine,
        locations: server.location,
      });
    },
    downloadComplete: function(data) {
      console.log("Download test is complete:\n\tInstantaneous server bandwidth: ", data.LastServerMeasurement.BBRInfo.BW * 8 / 1000000, "\n\tMean client bandwidth: ", data.LastClientMeasurement.MeanClientMbps)
    },
    uploadComplete: function(data) {
      console.log("Upload test is complete:\n\tMean server bandwidth: ", data.LastServerMeasurement, "\n\tMean client bandwidth: ", data.LastClientMeasurement)
    }

  }).then(code => {
  process.exit(code);
})
