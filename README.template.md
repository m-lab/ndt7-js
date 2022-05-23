# ndt7-js

The official [NDT7](https://github.com/m-lab/ndt-server) Javascript client
library. This code works in all modern browsers and is the source for the npm
package [`@m-lab/ndt7`](https://www.npmjs.com/package/@m-lab/ndt7).

Includes an example web client in the `examples/` directory. Pull requests
gratefully accepted if you would like to write a more sophisticated web or CLI
client that uses the returned measurements to debug network conditions.

In case you need a standalone client binary that you can build and run on
multiple operating systems and CPU architectures (including embedded devices)
have a look at the
[official Go client](https://github.com/m-lab/ndt7-client-go) instead.

## API Reference

{{#namespace name="ndt7"}}
{{>main}}
{{/namespace}}
