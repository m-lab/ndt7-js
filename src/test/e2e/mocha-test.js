const { Builder, Capabilities, until, By } = require("selenium-webdriver");
const chai = require("chai");
const expect = chai.expect;

var buildDriver = function () {
  return new Builder()
    .usingServer("http://localhost:4444/wd/hub")
    .withCapabilities(Capabilities.chrome())
    .build();
};

// BrowserStack capabilities will be set via environment variables by the SDK
describe("NDT7 Network Speed Test", function () {
  let driver;

  before(function () {
    driver = buildDriver();
  });

  // Set generous timeouts for network operations
  this.timeout(120000); // 2 minute overall timeout

  after(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it("check tunnel is working", async function () {
    await driver.get("http://bs-local.com:45454/");
    let title = await driver.getTitle();
    expect(title).to.match(/BrowserStack Local/i);
  });

  it("should complete full NDT7 speed test flow", async function () {
    // Navigate to the test page
    await driver.get("http://localhost:5000");

    // Wait for DOM to be ready first
    await driver.wait(
      async () => {
        try {
          const domReady = await driver.executeScript(
            'return document.readyState === "complete"',
          );
          return domReady;
        } catch (e) {
          return false;
        }
      },
      15000,
      "Page should be fully loaded",
    );

    // Small delay to ensure scripts are parsed
    await driver.sleep(1000);

    // Wait for ndt7 to be available
    await driver.wait(
      async () => {
        try {
          const ndt7Available = await driver.executeScript(
            'return typeof ndt7 !== "undefined"',
          );
          return ndt7Available;
        } catch (e) {
          return false;
        }
      },
      10000,
      "NDT7 library should be loaded",
    );

    // Initialize test state tracking and start the test
    await driver.executeScript(`
      // Initialize test state tracking
      window.testState = {
        serverChosen: false,
        downloadStarted: false,
        downloadMeasurements: 0,
        downloadComplete: false,
        uploadStarted: false,
        uploadMeasurements: 0,
        uploadComplete: false,
        errors: [],
        testFinished: false,
        exitCode: null
      };

      // Start the NDT7 test
      window.testPromise = ndt7.test({
        userAcceptedDataPolicy: true,
        downloadworkerfile: "ndt7-download-worker.min.js",
        uploadworkerfile: "ndt7-upload-worker.min.js",
        loadbalancer: "https://locate-dot-mlab-sandbox.appspot.com/v2/nearest/ndt/ndt7"
      }, {
        serverChosen: (server) => {
          console.log("Server chosen:", server.machine);
          window.testState.serverChosen = true;
          window.testState.serverName = server.machine;
        },
        downloadStart: (data) => {
          console.log("Download test started");
          window.testState.downloadStarted = true;
        },
        downloadMeasurement: (data) => {
          if (data.Source === "client") {
            console.log("Download measurement:", data.Data.MeanClientMbps);
            window.testState.downloadMeasurements++;
            window.testState.lastDownloadSpeed = data.Data.MeanClientMbps;
          }
        },
        downloadComplete: (data) => {
          console.log("Download test complete:", data.LastClientMeasurement.MeanClientMbps);
          window.testState.downloadComplete = true;
          window.testState.finalDownloadSpeed = data.LastClientMeasurement.MeanClientMbps;
        },
        uploadStart: (data) => {
          console.log("Upload test started");
          window.testState.uploadStarted = true;
        },
        uploadMeasurement: (data) => {
          if (data.Source === "client") {
            console.log("Upload measurement:", data.Data.MeanClientMbps);
            window.testState.uploadMeasurements++;
            window.testState.lastUploadSpeed = data.Data.MeanClientMbps;
          }
        },
        uploadComplete: (data) => {
          console.log("Upload test complete:", data.LastClientMeasurement.MeanClientMbps);
          window.testState.uploadComplete = true;
          window.testState.finalUploadSpeed = data.LastClientMeasurement.MeanClientMbps;
        },
        error: (error) => {
          console.error("NDT7 error:", error);
          window.testState.errors.push(error);
        }
      }).then((exitCode) => {
        window.testState.exitCode = exitCode;
        window.testState.testFinished = true;
        return exitCode;
      }).catch((error) => {
        console.error("NDT7 test failed:", error);
        window.testState.errors.push(error);
        window.testState.testFinished = true;
        throw error;
      });
    `);

    // Wait for server discovery and selection (generous timeout for slow networks)
    await driver.wait(
      async () => {
        const state = await driver.executeScript("return window.testState");
        return state && state.serverChosen;
      },
      30000,
      "Server should be discovered and chosen",
    );

    let state = await driver.executeScript("return window.testState");
    expect(state.serverName).to.be.a(
      "string",
      "Server name should be provided",
    );

    // Wait for download test to start
    await driver.wait(
      async () => {
        const state = await driver.executeScript("return window.testState");
        return state && state.downloadStarted;
      },
      20000,
      "Download test should start",
    );

    // Wait for download measurements (at least one measurement should be received)
    await driver.wait(
      async () => {
        const state = await driver.executeScript("return window.testState");
        return state && state.downloadMeasurements > 0;
      },
      15000,
      "Download measurements should be received",
    );

    // Wait for download test to complete
    await driver.wait(
      async () => {
        const state = await driver.executeScript("return window.testState");
        return state && state.downloadComplete;
      },
      20000,
      "Download test should complete",
    );

    state = await driver.executeScript("return window.testState");
    expect(state.finalDownloadSpeed).to.be.a(
      "number",
      "Final download speed should be a number",
    );
    expect(state.finalDownloadSpeed).to.be.greaterThan(
      0,
      "Download speed should be greater than 0",
    );

    // Wait for upload test to start
    await driver.wait(
      async () => {
        const state = await driver.executeScript("return window.testState");
        return state && state.uploadStarted;
      },
      20000,
      "Upload test should start",
    );

    // Wait for upload measurements
    await driver.wait(
      async () => {
        const state = await driver.executeScript("return window.testState");
        return state && state.uploadMeasurements > 0;
      },
      15000,
      "Upload measurements should be received",
    );

    // Wait for upload test to complete
    await driver.wait(
      async () => {
        const state = await driver.executeScript("return window.testState");
        return state && state.uploadComplete;
      },
      20000,
      "Upload test should complete",
    );

    state = await driver.executeScript("return window.testState");
    expect(state.finalUploadSpeed).to.be.a(
      "number",
      "Final upload speed should be a number",
    );
    expect(state.finalUploadSpeed).to.be.greaterThan(
      0,
      "Upload speed should be greater than 0",
    );

    // Wait for the entire test to finish
    await driver.wait(
      async () => {
        const state = await driver.executeScript("return window.testState");
        return state && state.testFinished;
      },
      5000,
      "Test should finish",
    );

    // Verify no errors occurred
    state = await driver.executeScript("return window.testState");
    expect(state.errors).to.deep.equal(
      [],
      "No errors should occur during the test",
    );
    expect(state.exitCode).to.equal(
      0,
      "Test should exit with code 0 (success)",
    );

    // Log final results
    console.log("Test completed successfully:");
    console.log(`Download speed: ${state.finalDownloadSpeed} Mbps`);
    console.log(`Upload speed: ${state.finalUploadSpeed} Mbps`);
    console.log(`Download measurements: ${state.downloadMeasurements}`);
    console.log(`Upload measurements: ${state.uploadMeasurements}`);
  });
});
