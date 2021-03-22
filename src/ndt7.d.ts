declare module '@m-lab/ndt7' {
    type URLType = '///ndt/v7/download' | '///ndt/v7/upload';
    type URLs = Record<URLType, string>;

    interface Location {
        city: string;
        country: string;
    }

    interface ServerChoice {
        machine: string;
        location: Location;
        urls: URLs;
    }

    interface Config {
        userAcceptedDataPolicy?: boolean;
        mlabDataPolicyInapplicable?: boolean;
    }

    interface DiscoverServerURLsConfig extends Config {
        loadbalancer?: string;
        protocol?: string;
        server?: string;
    }

    interface DownloadTestConfig extends Config {
        downloadworkerfile?: string;
    }

    interface UploadTestConfig extends Config {
        uploadworkerfile?: string;
    }

    interface Callbacks {
        error?: (error: string) => void;
    }

    interface DiscoverServerURLsCallbacks extends Callbacks {
        serverDiscovery?: (options: { loadbalancer: string | URL }) => void;
        serverChosen?: (choice: ServerChoice) => void;
    }

    interface DownloadTestCallbacks extends Callbacks {
        downloadStart?: (data: unknown) => void;
        downloadMeasurement?: (data: MeasurementData) => void;
        downloadComplete?: (data: TestCompleteData) => void;

    }

    interface UploadTestCallbacks extends Callbacks {
        uploadStart?: (data: unknown) => void;
        uploadMeasurement?: (data: MeasurementData) => void;
        downloadComplete?: (data: TestCompleteData) => void;
    }

    interface MeasurementData<TData> {
        Source: string;
        Data: TData;
    }

    interface ClientData {
        ElapsedTime: number;
        NumBytes: number;
        MeanClientMbps: number;
    };

    interface ServerData {
        
    };

    interface TestCompleteData {
        LastClientMeasurement: ClientData;
        LastServerMeasurement: ServerData;
    }

    export function discoverServerURLs(config: DiscoverServerURLsConfig, userCallbacks: DiscoverServerURLsCallbacks) : Promise<URLs>;
    export function downloadTest(config: DownloadTestConfig, userCallbacks: DownloadTestCallbacks, urlPromise: Promise<URLs>) : Promise<number>;
    export function uploadTest(config: UploadTestConfig, userCallbacks: UploadTestCallbacks, urlPromise: Promise<URLs>) : Promise<number>;
    export function test(config: Config, userCallbacks: Callbacks) : Promise<number>;
};