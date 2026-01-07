# ndt7-js

The official [NDT7](https://github.com/m-lab/ndt-server) Javascript client
library. This code works in all modern browsers and is the source for the npm
package [`@m-lab/ndt7`](https://www.npmjs.com/package/@m-lab/ndt7).

Includes an example web client in the `examples/` directory. Pull requests
gratefully accepted if you would like to write a more sophisticated web client
that uses the returned measurements to debug network conditions.

In case you need a standalone client binary that you can build and run on
multiple operating systems and CPU architectures (including embedded devices)
have a look at the
[official Go client](https://github.com/m-lab/ndt7-client-go) instead.

## API Reference

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

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>Object</code> |  | An associative array of configuration options. |
| [config.server] | <code>string</code> |  | Optional server hostname to connect to     directly, bypassing the locate service. Useful for testing against a     specific NDT server. |
| [config.protocol] | <code>string</code> | <code>&quot;&#x27;wss&#x27;&quot;</code> | WebSocket protocol to use.     Either 'wss' (secure WebSocket) or 'ws' (insecure). Defaults to 'wss'. |
| [config.metadata] | <code>Object</code> |  | Optional metadata to identify your     application. Recommended fields: `client_name` (your application name,     e.g., 'my-speed-test') and `client_version` (your application version,     e.g., '2.1.0'). These are sent as query parameters to help distinguish     different integrations. The library automatically includes     `client_library_name` ('ndt7-js') and `client_library_version`. |
| [config.loadbalancer] | <code>string</code> |  | Optional custom locate service     URL to use instead of the default M-Lab locate service. |
| [config.clientRegistrationToken] | <code>string</code> |  | Optional JWT token for     registered integrator access. When provided, identifies that tests are     being run through a registered client integration, enabling access to     the priority endpoint (v2/priority/nearest) with higher rate limits.     The token should be obtained from your integrator backend that securely     manages API credentials with the M-Lab token exchange service. This     registers your client implementation, not individual end users. |
| userCallbacks | <code>Object</code> |  | An associative array of user callbacks. |
| [userCallbacks.error] | <code>function</code> |  | Called when an error occurs.     Receives an error message string. If not provided, errors throw. |
| [userCallbacks.serverDiscovery] | <code>function</code> |  | Called when server     discovery starts. Receives `{loadbalancer: URL}` where URL is the     locate service URL being queried. |
| [userCallbacks.serverChosen] | <code>function</code> |  | Called when a server     is selected. Receives the server object from locate results. |

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
**Returns**: <code>number</code> - Zero on success, non-zero on failure.  
**Access**: public  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| config | <code>Object</code> |  | An associative array of configuration options. |
| [config.server] | <code>string</code> |  | Optional server hostname to connect to     directly, bypassing the locate service. Useful for testing against a     specific NDT server. |
| [config.protocol] | <code>string</code> | <code>&quot;&#x27;wss&#x27;&quot;</code> | WebSocket protocol to use.     Either 'wss' (secure WebSocket) or 'ws' (insecure). Defaults to 'wss'. |
| [config.metadata] | <code>Object</code> |  | Optional metadata to identify your     application. Recommended fields: `client_name` (your application name,     e.g., 'my-speed-test') and `client_version` (your application version,     e.g., '2.1.0'). These are sent as query parameters to help distinguish     different integrations. The library automatically includes     `client_library_name` ('ndt7-js') and `client_library_version`. |
| [config.loadbalancer] | <code>string</code> |  | Optional custom locate service     URL to use instead of the default M-Lab locate service. |
| [config.clientRegistrationToken] | <code>string</code> |  | Optional JWT token for     registered integrator access. When provided, identifies that tests are     being run through a registered client integration, enabling access to     the priority endpoint (v2/priority/nearest) with higher rate limits.     The token should be obtained from your integrator backend that securely     manages API credentials with the M-Lab token exchange service. This     registers your client implementation, not individual end users. |
| [config.userAcceptedDataPolicy] | <code>boolean</code> |  | Must be set to true     to indicate the user has accepted M-Lab's data policy. Required unless     mlabDataPolicyInapplicable is true. |
| [config.mlabDataPolicyInapplicable] | <code>boolean</code> |  | Set to true if     M-Lab's data policy does not apply to your use case. |
| userCallbacks | <code>Object</code> |  | An associative array of user callbacks. |
| [userCallbacks.error] | <code>function</code> |  | Called when an error occurs.     Receives an error message string. If not provided, errors throw. |
| [userCallbacks.serverDiscovery] | <code>function</code> |  | Called when server     discovery starts. Receives `{loadbalancer: URL}` where URL is the     locate service URL being queried. |
| [userCallbacks.serverChosen] | <code>function</code> |  | Called when a server     is selected. Receives the server object from locate results. |
| [userCallbacks.downloadStart] | <code>function</code> |  | Called when download     test starts. Receives start event data. |
| [userCallbacks.downloadMeasurement] | <code>function</code> |  | Called during     download test. Receives `{Source, Data}` where Source is 'client'     or 'server' and Data contains measurement values. |
| [userCallbacks.downloadComplete] | <code>function</code> |  | Called when download     completes. Receives `{LastClientMeasurement, LastServerMeasurement}`. |
| [userCallbacks.uploadStart] | <code>function</code> |  | Called when upload     test starts. Receives start event data. |
| [userCallbacks.uploadMeasurement] | <code>function</code> |  | Called during     upload test. Receives `{Source, Data}` where Source is 'client'     or 'server' and Data contains measurement values. |
| [userCallbacks.uploadComplete] | <code>function</code> |  | Called when upload     completes. Receives `{LastClientMeasurement, LastServerMeasurement}`. |

