/* eslint-env es6, browser, node, worker */

// Node doesn't have WebSocket defined, so it needs this library.
if (typeof WebSocket === 'undefined') {
  global.WebSocket = require('isomorphic-ws');
}

// WebWorker that runs the ndt7 upload test
const workerMain = function(ev) {
  //let url = new URL(config.baseURL)
  //url.protocol = (url.protocol === "https:") ? "wss:" : "ws:"
  //url.pathname = "/ndt/v7/upload"
  const url = ev.data['ws:///ndt/v7/upload']
  const sock = new WebSocket(url, 'net.measurementlab.ndt.v7')
  let now = () => new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now !== 'undefined') {
    now = performance.now
  }
  uploadTest(sock, postMessage, now)
};

const uploadTest = function(sock, postMessage, now) {
  let closed = false
  sock.onclose = function () {
    if (!closed) {
      closed = true
      postMessage({
        MsgType: 'complete',
      })
    }
  }
  
  function uploader(data, start, end, previous, total) {
    if (closed) {
      // socket.send() with too much buffering causes socket.close(). We only
      // observed this behaviour with pre-Chromium Edge.
      return
    }
    let t = now()
    if (t >= end) {
      sock.close()
      return
    }

    const maxMessageSize = 16777216 /* = (1<<24) = 16MB */
    const nextSizeIncrement = (data.length >= maxMessageSize) ? Infinity : 16 * data.length;
    if (total >= nextSizeIncrement) {
      // TODO(bassosimone): fill this message. Filling the message is not a
      // concern when we're using secure WebSockets.
      data = new Uint8Array(data.length * 2)
    }

    const clientMeasurementInterval = 250  // ms
    if (t >= previous + clientMeasurementInterval) {
      postMessage({
        MsgType: 'measurement',
        AppInfo: {
          ElapsedTime: (t - start) / 1000,  // seconds
          NumBytes: (total - sock.bufferedAmount),
        },
        Origin: 'client',
        Test: 'upload',
      })
      previous = t
    }

    const desiredBuffer = 8 * data.length
    const loopEndTime = Math.min(previous + clientMeasurementInterval, end)
    
    while (sock.bufferedAmount < desiredBuffer  // We would still like to buffer more messages
           && t < loopEndTime                   // and we haven't been running for too long
           && total < nextSizeIncrement         // and we don't need to resize the message.
    ) {
      sock.send(data)
      t = now()
      total += data.length
    }
    
    // Loop the uploader function in a way that respects the JS event handler.
    setTimeout(function () { uploader(data, start, end, previous, total) }, 0);
  }

  sock.onopen = function () {
    const initialMessageSize = 8192 /* (1<<13) bytes */
    // TODO(bassosimone): fill this message - see above comment
    const data = new Uint8Array(initialMessageSize)
    const start = now()           // ms since epoch
    const duration = 10000        // ms
    const end = start + duration  // ms since epoch

    postMessage({
      MsgType: 'start',
      StartTime: start / 1000,      // seconds since epoch
      ExpectedEndTime: end / 1000,  // seconds since epoch
    })
    
    uploader(data, start, end, start, 0)
  }
}

// Node and browsers get onmessage defined differently.
if (typeof self !== "undefined") {
  self.onmessage = workerMain;
} else if (typeof this !== "undefined") {
  this.onmessage = workerMain;
} else if (typeof onmessage !== "undefined") {
  onmessage = workerMain;
}