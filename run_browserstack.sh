#!/bin/bash
# This script runs the e2e tests on browserstack.

set -e # Exit immediately if a command exits with a non-zero status.
set -u # Treat unset variables as an error.

# Define an array of browsers to run.
BROWSERS_WINDOWS=(
    "browserstack:chrome@99.0:Windows 11"
    # "browserstack:opera@84.0:Windows 11"
    # "browserstack:edge@99.0:Windows 11"
    # "browserstack:firefox@98.0:Windows 11"
)

BROWSERS_MACOS_SAFARI=(
    # Note: Safari 15 support is broken on TestCafe.
    # https://github.com/DevExpress/testcafe/issues/6632
    #
    #"browserstack:safari@15.3:OS X Monterey"
    "browserstack:safari@14.1:OS X Big Sur"
    "browserstack:safari@13.1:OS X Catalina"
    "browserstack:safari@12.1:OS X Mojave"
    "browserstack:safari@11.1:OS X High Sierra"
)

BROWSERS_MACOS_OTHERS=(
    "browserstack:chrome@99.0:OS X Monterey"
    "browserstack:opera@84.0:OS X Monterey"
    "browserstack:edge@99.0:OS X Monterey"
    "browserstack:firefox@98.0:OS X Monterey"
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

    # Wait for the processes to finish. If any of them fails, terminate the
    # test server and exit with a non-zero status.
    for pid in $pids; do
        if ! wait "$pid"; then
            echo "TestCafe tests failed for at least one browser."
            kill $NODE_PID
            exit 1
        fi
    done
}

# Run the test server.
node src/test/e2e/server.js &
NODE_PID=$!

TRAVIS_BUILD_ID=${TRAVIS_BUILD_ID:-manual-$(date +%Y%m%d-%H%M%S)}
export BROWSERSTACK_CAPABILITIES_CONFIG_PATH="`pwd`/browserstack-config.json"
export BROWSERSTACK_BUILD_ID="${TRAVIS_BUILD_ID}"

# Run each group of tests.
#run_tests "${BROWSERS_WINDOWS[@]}"
#run_tests "${BROWSERS_MACOS_SAFARI[@]}"
run_tests "${BROWSERS_MACOS_OTHERS[@]}"

# Terminate the test server.
kill $NODE_PID