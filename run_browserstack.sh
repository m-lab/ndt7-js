#!/bin/bash
# This script runs the e2e tests on browserstack.

set -e # Exit immediately if a command exits with a non-zero status.
set -u # Treat unset variables as an error.

# Check that BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY are set.
BROWSERSTACK_USERNAME=${BROWSERSTACK_USERNAME:?"Please set BROWSERSTACK_USERNAME"}
BROWSERSTACK_ACCESS_KEY=${BROWSERSTACK_ACCESS_KEY:?"Please set BROWSERSTACK_ACCESS_KEY"}

# Define an array of browsers to run.
BROWSERS_WINDOWS=(
    "browserstack:chrome:Windows 11"
    "browserstack:edge:Windows 11"
    "browserstack:firefox:Windows 11"
)

BROWSERS_MACOS_SAFARI=(
    # Note: Safari 15 support is broken on TestCafe.
    # https://github.com/DevExpress/testcafe/issues/6632
    #
    #"browserstack:safari@15.3:OS X Monterey"
    "browserstack:safari:OS X Big Sur"
    "browserstack:safari:OS X Catalina"
    "browserstack:safari:OS X Mojave"
    "browserstack:safari:OS X High Sierra"
)

BROWSERS_MACOS_OTHERS=(
    "browserstack:chrome:OS X Monterey"
    "browserstack:edge:OS X Monterey"
    "browserstack:firefox:OS X Monterey"
)

BROWSERS_IPHONE=(
    "browserstack:iPhone 13@15"
    "browserstack:iPhone 12@14"
    "browserstack:iPhone 11@13"
    "browserstack:iPhone 8@13"
)

BROWSERS_ANDROID=(
    "browserstack:Google Nexus 6@6.0"
    "browserstack:Samsung Galaxy S8@7.0"
    "browserstack:Google Pixel@7.1"
    "browserstack:OnePlus 9@11.0"
    "browserstack:Xiaomi Redmi Note 8@9.0"
)

function run_tests() {
    # Run TestCafe for each browser. Here we could define multiple environments
    # on a single TestCafe instance, but this does not work with Safari, for
    # reasons unclear. Thus, we run TestCafe for each browser in a separate
    # instance, save the pids of the instances, and wait for them to finish.
    browsers=("$@")
    pids=""
    for ((i = 0; i < ${#browsers[@]}; i++)); do
        echo "Running tests for ${browsers[$i]}..."
        export BROWSERSTACK_TEST_RUN_NAME="${browsers[$i]}"
        testcafe "${browsers[$i]}" src/test/e2e/test.js &
        pids+=" $!"
    done

    # Wait for the processes to finish. If any of them fails, exit with a
    # non-zero status.
    for pid in $pids; do
        if ! wait "$pid"; then
            echo "TestCafe tests failed for at least one browser."
            exit 1
        fi
    done
}

# If there isn't an identifier for BrowserStackLocal already, download the
# binary and start it to create the tunnel. The BROWSERSTACK_LOCAL_IDENTIFIER
# variable is set already when running on Travis. This allows running this
# script locally.
BROWSERSTACK_LOCAL_IDENTIFIER=${BROWSERSTACK_LOCAL_IDENTIFIER:-}
BROWSERSTACK_LOCAL_PID=""
if [ -z "$BROWSERSTACK_LOCAL_IDENTIFIER" ]; then
    echo "Starting BrowserStackLocal..."
    # Download the binary if needed.
    if [ ! -f "./BrowserStackLocal" ]; then
        wget https://www.browserstack.com/browserstack-local/BrowserStackLocal-linux-x64.zip
        unzip BrowserStackLocal-linux-x64.zip
    fi
    # --parallel-runs is set to the number of parallels supported by the
    # BrowserStack account.
    ./BrowserStackLocal --key $BROWSERSTACK_ACCESS_KEY \
        --local-identifier testcafe-manual-tunnel --parallel-runs 5 &
    BROWSERSTACK_LOCAL_PID=$!

    # Give BrowserStackLocal more time to start and establish stable connection.
    sleep 10

    export BROWSERSTACK_LOCAL_IDENTIFIER="testcafe-manual-tunnel"
fi

# Run the test server.
node src/test/e2e/server.js &
NODE_PID=$!

# Some capabilities can only be configured via a separate JSON file.
export BROWSERSTACK_CAPABILITIES_CONFIG_PATH="`pwd`/browserstack-config.json"
# When this script is run by Travis, we just use Travis' build ID.
# When it is run locally, we generate an ID with the current date/time.
TRAVIS_BUILD_ID=${TRAVIS_BUILD_ID:-manual-$(date +%Y%m%d-%H%M%S)}
export BROWSERSTACK_BUILD_ID="${TRAVIS_BUILD_ID}"
# Use Automate instead of Javascript Testing. This allows to specify further
# capabilities (such as network logs and connection throttling).
export BROWSERSTACK_USE_AUTOMATE="1"
# Save console and network logs.
export BROWSERSTACK_CONSOLE="verbose"
export BROWSERSTACK_NETWORK_LOGS="1"

# Run each group of tests.
run_tests "${BROWSERS_WINDOWS[@]}"
run_tests "${BROWSERS_MACOS_SAFARI[@]}"
run_tests "${BROWSERS_MACOS_OTHERS[@]}"
run_tests "${BROWSERS_IPHONE[@]}"
run_tests "${BROWSERS_ANDROID[@]}"

# Terminate the test server.
kill $NODE_PID

# Terminate the browserstack tunnel if needed.
if [ -n "$BROWSERSTACK_LOCAL_PID" ]; then
    kill $BROWSERSTACK_LOCAL_PID
fi