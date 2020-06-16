/* eslint-env browser, node, worker */

// Node doesn't have WebSocket defined, so it needs this library.
if (typeof WebSocket === 'undefined') {
  global.WebSocket = require('isomorphic-ws');
}

// workerMain is the WebWorker function that runs the ndt7 download test.
const workerMain = function (ev) {
  'use strict'
  // TODO put the choce between secure and insecure here
  //let url = new URL(ev.data.href)
  //url.protocol = (url.protocol === 'https:') ? 'wss:' : 'ws:'
  //url.pathname = '/ndt/v7/download'
  const url = ev.data['ws:///ndt/v7/download']
  const sock = new WebSocket(url, 'net.measurementlab.ndt.v7')
  let now = () => new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') {
    now = performance.now
  }
  downloadTest(sock, postMessage, now)
};

/**
 * downloadTest is a function that runs an ndt7 download test using the 
 * passed-in websocket instance and the passed-in callback function.  The 
 * socket and callback are passed in to enable testing and mocking.
 */
const downloadTest = function (sock, postMessage, now) {
  sock.onclose = function () {
    postMessage({
      MsgType: "complete"
    })
  }

  sock.onerror = function (ev) {
    postMessage({
      MsgType: 'error',
      Error: ev,
    })
  }

  let start = now()
  let previous = start
  let total = 0

  sock.onopen = function () {
    start = now()
    previous = start
    total = 0
  }

  sock.onmessage = function (ev) {
    total += (typeof ev.data.size !== 'undefined') ? ev.data.size : ev.data.length
    // Perform a client-side measurement 4 times per second.
    let t = now()
    const every = 250  // ms
    if (t - previous > every) {
      postMessage({
        MsgType: 'measurement',
        ClientData: {
          ElapsedTime: (now - start) * 1000,  // us
          NumBytes: total,
          MeanClientMbps: total*8 / (now - start) / 1000  // Bytes * 8 bits/byte * 1/(duration in ms) * 1000ms/s * 1 Mb / 1000000 bits = Mb/s
        },
        Source: 'client',
      })
      previous = now
    }

    // Pass along every server-side measurement.
    if (typeof ev.data === 'string') {
      postMessage({
        MsgType: 'measurement',
        ServerMessage: ev.data,
        Source: 'server',
      })
    }
  }
};

// Node and browsers get onmessage defined differently.
if (typeof self !== "undefined") {
  self.onmessage = workerMain;
} else if (typeof this !== "undefined") {
  this.onmessage = workerMain;
} else if (typeof onmessage !== "undefined") {
  onmessage = workerMain;
}