declare module '@m-lab/ndt7' {
    type URLType = '///ndt/v7/download' | '///ndt/v7/upload';
    type URLs = Record<URLType, string>;

    /** 
     * @typedef {object} Location - location of the server
     */
    interface Location {
        city: string;
        country: string;
    }

    /** 
     * @typedef {object} ServerChoice - server chosen to run specified ndt7 test 
     * @property {string} machine - server URL 
     * @property {Location} location - server location 
     * @property {URLs} urls - URLs used to perform ndt7 download and upload tests
     */
    interface ServerChoice {
        machine: string;
        location: Location;
        urls: URLs;
    }

    /**  
     * @typedef {object} Config - configuration options for ndt7 functions
     * @property {boolean} [userAcceptedDataPolicy] - whether the user has accepted the M-Lab data policy
     * @property {boolean} [mlabDataPolicyInapplicable] - whether the M-Lab data policy is applicable to the user
     */
    interface Config {
        userAcceptedDataPolicy?: boolean;
        mlabDataPolicyInapplicable?: boolean;
    }

    /**  
     * @typedef {object} DiscoverServerURLsConfig - configuration options for discoverServerUrls() 
     * @property {string} [loadbalancer] - load balancer to locate servers to perform specified ndt7 test. If no loadbalancer is specified, the default is M-Lab's locate service. 
     * @property {string} [protocol] - protocol to establish connection between server and client. If no protocol is specified, the default is 'wss' (WebSocket Secure). 
     * @property {string} [server] - server to run specified ndt7 test 
     */
    interface DiscoverServerURLsConfig extends Config {
        loadbalancer?: string;
        protocol?: string;
        server?: string;
    }

    /** 
     * @typedef {object} DownloadTestConfig - configuration options for downloadTest() 
     * @property {string} [downloadworkerfile] - file used to initialize ndt7 download worker. Can be a file path or URL. 
     */
    interface DownloadTestConfig extends Config {
        downloadworkerfile?: string;
    }

    /**  
     * @typedef {object} UploadTestConfig - configuration options for uploadTest() 
     * @property {string} [uploadworkerfile] - file used to initialize ndt7 upload worker. Can be a file path or URL. 
     */
    interface UploadTestConfig extends Config {
        uploadworkerfile?: string;
    }

    /** 
     * @typedef {object} Callbacks - client-specified callbacks 
     * @property {function} [error] - callback that is invoked upon error. If no error callback is specified, the default response to an error is to throw an exception. 
     */
    interface Callbacks {
        error?: (error: string) => void;
    }
    
    /** 
     * @typedef {object} DiscoverServerURLsCallbacks - client-specified callbacks for discoverServerURLs() 
     * @property {function} [serverDiscovery] - callback that is invoked when server is discovered
     * @property {function} [serverChosen] - callback that is invoked when server is chosen 
     */
    interface DiscoverServerURLsCallbacks extends Callbacks {
        serverDiscovery?: (options: { loadbalancer: string | URL }) => void;
        serverChosen?: (choice: ServerChoice) => void;
    }

    /** 
     * @typedef {object} DownloadTestCallbacks - client-specified callbacks for downloadTest() 
     * @property {function} [downloadStart] - callback that is invoked when download test starts
     * @property {function} [downloadMeasurement] - callback that is invoked while performing download test 
     * @property {function} [downloadComplete] - callback that is invoked when download test is complete
     */
    interface DownloadTestCallbacks extends Callbacks {
        downloadStart?: (data: unknown) => void;
        downloadMeasurement?: (data: MeasurementData) => void;
        downloadComplete?: (data: TestCompleteData) => void;

    }

    /** 
     * @typedef {object} UploadTestCallbacks - client-specified callbacks for uploadTest() 
     * @property {function} [uploadStart] - callback that is invoked when upload test starts
     * @property {function} [uploadMeasurement] - callback that is invoked while performing upload test 
     * @property {function} [uploadComplete] - callback that is invoked when upload test is complete
     */
    interface UploadTestCallbacks extends Callbacks {
        uploadStart?: (data: unknown) => void;
        uploadMeasurement?: (data: MeasurementData) => void;
        downloadComplete?: (data: TestCompleteData) => void;
    }

    /** 
     * @typedef {object} MeasurementData - measurement data calculated while performing specified ndt7 test 
     * @property {string} Source - source of the measurement data. The two possible sources are client and server. 
     * @property {ClientData | ServerData} - measurement data from specified source
     */
    interface MeasurementData {
        Source: string;
        Data: ClientData | ServerData;
    }

    /** 
     * @typedef {object} ClientData - measurement data from the client  
     */
    interface ClientData {
        ElapsedTime: number;
        NumBytes: number;
        MeanClientMbps: number;
    };

    /** 
     * @typedef {object} ServerData - measurement data from the server 
     */
    interface ServerData {
        
    };

    /** 
     * @typedef TestCompleteData - data calculated once the specified test is complete 
     */
    interface TestCompleteData {
        LastClientMeasurement: ClientData;
        LastServerMeasurement: ServerData;
    }

    export function discoverServerURLs(config?: DiscoverServerURLsConfig, userCallbacks?: DiscoverServerURLsCallbacks) : Promise<URLs>;
    export function downloadTest(config?: DownloadTestConfig, userCallbacks?: DownloadTestCallbacks, urlPromise: Promise<URLs>) : Promise<number>;
    export function uploadTest(config?: UploadTestConfig, userCallbacks?: UploadTestCallbacks, urlPromise: Promise<URLs>) : Promise<number>;
    export function test(config?: Config, userCallbacks?: Callbacks) : Promise<number>;
}