#!/bin/bash
# This script runs the e2e tests on browserstack.

set -e # Exit immediately if a command exits with a non-zero status.
set -u # Treat unset variables as an error.
set -x # Print commands and their arguments as they are executed.

# Define an array of browsers to run.
BROWSERS_WINDOWS=(
    "browserstack:chrome@99.0:Windows 11"
    "browserstack:opera@84.0:Windows 11"
    "browserstack:edge@99.0:Windows 11"
    "browserstack:firefox@98.0:Windows 11"
)

BROWSERS_MACOS_SAFARI=(
    # Note: Safari 15 support is broken on TestCafe.
    "browserstack:safari@15.3:OS X Monterey"
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
    BROWSER_LIST=""
    BROWSERS=("$@")
    for ((i = 0; i < ${#BROWSERS[@]}; i++)); do
        BROWSER_LIST="${BROWSER_LIST},\"${BROWSERS[i]}\""
    done
    
    # Remove the initial comma.
    BROWSER_LIST=${BROWSER_LIST:1}

    testcafe "$BROWSER_LIST" src/test/e2e/test.js --app "node src/test/e2e/server.js"
}

# run_tests "${BROWSERS_WINDOWS[@]}"
run_tests "${BROWSERS_MACOS_SAFARI[@]}"
# run_tests "${BROWSERS_MACOS_OTHERS[@]}"