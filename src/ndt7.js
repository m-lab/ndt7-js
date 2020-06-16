/* eslint-env browser, node, worker */

// ndt7 contains the core ndt7 client functionality. Please, refer
// to the ndt7 spec available at the following URL:
//
// https://github.com/m-lab/ndt-server/blob/master/spec/ndt7-protocol.md
//
// This implementation uses v0.9.0 of the spec.

// Wrap everything in a closure to ensure that local definitions don't 
// permanently shadow global definitions.
(function() {
  "use strict"

  // Initial includes in case this is running as a node module.
  if (typeof WebSocket === 'undefined') {
    global.WebSocket = require('isomorphic-ws');
  }
  if (typeof fetch === 'undefined') {
    global.fetch = require('node-fetch');
  }
  if (typeof Worker === 'undefined') {
    global.Worker = require('workerjs');
  }

  // 'ndt7' is the name of the module and this function defines its contents.
  const ndt7 = (function () {

    // cb creates a default-empty callback function, allowing library users to 
    // only need to specify callback functions for the events they care about.
    //
    // This function is not exported.
    var cb = function(name, callbacks, defaultFn) {
      // If no default function is provided, use the empty function.
      if (typeof defaultFn === 'undefined') {
        defaultFn = function(){};
      }
      if (typeof(callbacks) !== 'undefined' && name in callbacks) {
        return callbacks[name];
      } else {
        return defaultFn;
      }
    };

    // DiscoverServerURLs contacts a web service (likely the Measurement Lab 
    // locate service, but not necessarily) and gets URLs with access tokens 
    // in them for the client.  It can be short-circuted if config.server 
    // exists, which is useful for clients served from the webserver of an 
    // NDT server.
    //
    // It uses the callback functions `error`, `serverDiscovery`, and 
    // `serverChosen`.
    async function DiscoverServerURLs(config, userCallbacks) {
      const callbacks = {
        error: cb('error', userCallbacks, (err) => {throw new Error(err)}),
        serverDiscovery: cb('serverDiscovery', userCallbacks),
        serverChosen: cb('serverChosen', userCallbacks),
      };
      if (config && ('server' in config)) {
        return {
          'ws:///ndt/v7/download':  'ws://' + config.server + '/ndt/v7/download',
          'ws:///ndt/v7/upload':  'ws://' + config.server + '/ndt/v7/upload',
          'wss:///ndt/v7/download':  'wss://' + config.server + '/ndt/v7/download',
          'wss:///ndt/v7/upload':  'wss://' + config.server + '/ndt/v7/upload'
        };
      }
      // If no server was specified then use a loadbalancer. 
      // If no loadbalancer is specified, use the locate service from Measurement Lab.
      const lbURL = (config && ('loadbalancer' in config)) ? config.loadbalancer : new URL('https://locate-dot-mlab-staging.appspot.com/v2beta1/query/ndt/ndt7');
      callbacks.serverDiscovery({loadbalancer: lbURL});
      const response = await fetch(lbURL);
      const js = await response.json();
      if (! ('results' in js) ) {
        callbacks.error("Could not understand response from " + lbURL + ": " + js);
        return {};
      }
      const choice = js.results[Math.floor(Math.random() * js.results.length)];
      callbacks.serverChosen(choice);
      return choice.urls;
    }

    // runNDT7Worker is a helper function that runs a webworker.  It uses the 
    // callback functions `error`, `start`, `measurement`, and `complete`.  It
    // returns a c-style return code. 0 is success, non-zero is some kind of 
    // failure.
    //
    // This function is not exported.
    async function runNDT7Worker(config, callbacks, urlPromise, filename, testType) {
      if (config.userAcceptedDataPolicy !== true && config.mlabDataPolicyInapplicable !== true) {
        callbacks.error("The M-Lab data policy is applicable and the user has not explicitly accepted that data policy.");
        return 1;
      }

      var clientMeasurement, serverMeasurement;

      // __dirname only exists for node.js, but is required in that environment
      // to ensure that the files for the Worker are found in the right place.
      if (typeof __dirname !== 'undefined') {
        filename = __dirname + '/' + filename;
      }
      
      // This makes the worker. The worker won't actually start until it 
      // receives a message.
      const worker = new Worker(filename);
      
      // When the workerPromise gets resolved it will terminate the worker.
      // Workers are resolved with c-style return codes. 0 for success, 
      // non-zero for failure.
      const workerPromise = new Promise(resolve => { 
        worker.resolve = function (returnCode) { 
          worker.terminate(); 
          resolve(returnCode);
        } 
      });

      // If the worker takes 20 seconds, kill it and return an error code.
      setTimeout(() => worker.resolve(2), 20000) // 20 seconds
      
      // This is how the worker communicates back to the main thread of 
      // execution.  The MsgTpe of `ev` determines which callback the message
      // gets forwarded to.
      worker.onmessage = function (ev) {
        if (!ev.data || ev.data.MsgType === 'error') {
          worker.resolve(3);
          const errMsg = (!ev.data) ? 'There was a ' + testType + ' error' : ev.data.Error;
          callbacks.error(errMsg);
        } else if (ev.data.MsgType === 'start') {
          callbacks.start(ev.data);
        } else if (ev.data.MsgType == 'measurement') {
          if (ev.data.Source == 'server') {
            serverMeasurement = JSON.parse(ev.data.ServerMessage);
            callbacks.measurement({
              Source: ev.data.Source,
              Data: serverMeasurement,
            });
          } else {
            clientMeasurement = ev.data.ClientData;
            callbacks.measurement({
              Source: ev.data.Source,
              Data: ev.data.ClientData,
            });
          }
        } else if (ev.data.MsgType == 'complete') {
          worker.resolve(0)
          callbacks.complete({
            LastClientMeasurement: clientMeasurement,
            LastServerMeasurement: serverMeasurement,
          });
        }
      };

      // We can't start the worker until we know the right server, so we wait 
      // here to find that out.
      const urls = await urlPromise;

      // Start the worker.
      worker.postMessage(urls);

      // Await the resolution of the workerPromise.
      return await workerPromise

      // Liveness guarantee - once the promise is resolved, .terminate() has
      // been called and the webworker will be terminated or in the process of 
      // being terminated.
    }

    async function DownloadTest(config, userCallbacks, urlPromise) {
      const callbacks = {
        error: cb('error', userCallbacks, (err) => {throw new Error(err)}),
        start: cb('downloadStart', userCallbacks),
        measurement: cb('downloadMeasurement', userCallbacks),
        complete: cb('downloadComplete', userCallbacks),
      }
      return await runNDT7Worker(config, callbacks, urlPromise, 'ndt7-download-worker.js', 'download');
    }

    async function UploadTest(config, userCallbacks, urlPromise) {
      const callbacks = {
        error: cb('error', userCallbacks, (err) => {throw new Error(err)}),
        start: cb('uploadStart', userCallbacks),
        measurement: cb('uploadMeasurement', userCallbacks),
        complete: cb('uploadComplete', userCallbacks),
      }
      let rv = await runNDT7Worker(config, callbacks, urlPromise, 'ndt7-upload-worker.js', 'upload');
      return rv << 4;
    }
    
    return {
      DiscoverServerURLs: DiscoverServerURLs,
      DownloadTest: DownloadTest,
      UploadTest: UploadTest,
      Test: async function(config, userCallbacks) {
        // Starts the asynchronous process of server discovery, allowing other stuff to proceed in the background.
        const urlPromise = DiscoverServerURLs(config, userCallbacks);
        const downloadSuccess = await DownloadTest(config, userCallbacks, urlPromise);
        const uploadSuccess = await UploadTest(config, userCallbacks, urlPromise);
        return downloadSuccess + uploadSuccess;
      },
    }
  })()

  // Modules are a used by `require`, if this file is included on a web page, then we use the window.ndt7 piece.
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {  
    module.exports = ndt7
  } else {
    window.ndt7 = ndt7
  }
})();
