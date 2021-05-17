The official [NDT7](https://github.com/m-lab/ndt-server) Javascript client
libraries. This code works with Node.js >= 12, in a browser, and is the
source for the npm package `ndt7`.

Includes an example web client and an example node.js client in the `examples/`
directory. Pull requests gratefully accepted if you would like to write a
more sophisticated web or CLI client that uses the returned measurements to
debug network conditions.

# API Reference
<a name="ndt7"></a>

## ndt7 : <code>object</code>
**Kind**: global namespace  

* [ndt7](#ndt7) : <code>object</code>
    * [.discoverServerURLS](#ndt7.discoverServerURLS)
    * [.downloadTest](#ndt7.downloadTest) ⇒ <code>number</code>
    * [.uploadTest](#ndt7.uploadTest) ⇒ <code>number</code>
    * [.test](#ndt7.test) ⇒ <code>number</code>

<a name="ndt7.discoverServerURLS"></a>

### ndt7.discoverServerURLS
discoverServerURLs contacts a web service (likely the Measurement Lab
locate service, but not necessarily) and gets URLs with access tokens in
them for the client. It can be short-circuted if config.server exists,
which is useful for clients served from the webserver of an NDT server.

**Kind**: static property of [<code>ndt7</code>](#ndt7)  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | An associative array of configuration options. |
| userCallbacks | <code>Object</code> | An associative array of user callbacks. It uses the callback functions `error`, `serverDiscovery`, and `serverChosen`. |

<a name="ndt7.downloadTest"></a>

### ndt7.downloadTest ⇒ <code>number</code>
downloadTest runs just the NDT7 download test.

**Kind**: static property of [<code>ndt7</code>](#ndt7)  
**Returns**: <code>number</code> - Zero on success, and non-zero error code on failure.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | An associative array of configuration strings |
| userCallbacks | <code>Object</code> |  |
| urlPromise | <code>Object</code> | A promise that will resolve to urls. |

<a name="ndt7.uploadTest"></a>

### ndt7.uploadTest ⇒ <code>number</code>
uploadTest runs just the NDT7 download test.

**Kind**: static property of [<code>ndt7</code>](#ndt7)  
**Returns**: <code>number</code> - Zero on success, and non-zero error code on failure.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | An associative array of configuration strings |
| userCallbacks | <code>Object</code> |  |
| urlPromise | <code>Object</code> | A promise that will resolve to urls. |

<a name="ndt7.test"></a>

### ndt7.test ⇒ <code>number</code>
test discovers a server to run against and then runs a download test
followed by an upload test.

**Kind**: static property of [<code>ndt7</code>](#ndt7)  
**Returns**: <code>number</code> - Zero on success, and non-zero error code on failure.  
**Access**: public  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | An associative array of configuration strings |
| userCallbacks | <code>Object</code> |  |


