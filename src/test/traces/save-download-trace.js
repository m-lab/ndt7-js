/**
 * @fileoverview A node.js utility for saving a download trace to a specified
 * .jsonl file for subsequent playback to aid in end-to-end testing of clients.
 */
const argv = require('minimist')(
    process.argv.slice(2),
    {
      'default': {
        'server': undefined,
        'tracefile': undefined,
        'verbose': false,
      },
      'string': ['server', 'tracefile'],
      'boolean': ['verbose'],
    });
const fs = require('fs');

/** Defines a bunch of callbacks to write a websocket to a file.
 * @param {string} filename The name of the file to save the jsonl to
 * @param {bool} verbose Whether to print debug output
 * @return {object} an object containing callback functions
 */
function traceSaver(filename, verbose) {
  let f;
  const measurement = function(msg) {
    if (msg instanceof Buffer) {
      return;
    }
    if (verbose) {
      if (msg.length > 40) {
        console.log(msg.substring(0, 40) + '...');
      } else {
        console.log(msg);
      }
    }
    f.write(msg);
  };
  const start = function(msg) {
    f = fs.createWriteStream(filename);
  };
  const complete = function(msg) {
    f.end();
    f = undefined;
  };

  return {
    start: start,
    measurement: measurement,
    complete: complete,
  };
}

if (!argv.server || !argv.tracefile) {
  console.error('You must provide --server=... and --tracefile=... args.');
  process.exit(1);
}

const callbacks = traceSaver(argv.tracefile, argv.verbose);
const WebSocket = require('ws');

const ws = new WebSocket('ws://' + argv.server + '/ndt/v7/download', 'net.measurementlab.ndt.v7');
ws.on('open', callbacks.start);
ws.on('message', callbacks.measurement);
ws.on('close', callbacks.complete);
// The download can only proceed once this main() is done, as JS is
// single-threaded.
