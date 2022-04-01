import { Selector } from 'testcafe';

fixture `Test ndt7-js client`
    .page `http://localhost:5000`;

const server = Selector('#server');
const downloadStatus = Selector('#downloadStatus');
const download = Selector('#download');
const uploadStatus = Selector('#uploadStatus');
const upload = Selector('#upload');

test('Basic functionality tests', async t => {
    // The assertion timeout is set to 10 seconds, so notEql() will wait until
    // the server div becomes non-empty. This should be plenty of time for
    // Locate to return a server, but there is no guarantee. If that does not
    // happen it indicates a problem with either the testing machine or the
    // Locate service. In both cases, the test should fail.
    await t.expect(server.innerText).notEql('', { timeout: 10000 });

    // We're in the middle of the download test, so these divs should be
    // populated. A 10-second timeout is used here as well, to handle cases
    // where connecting to the server takes longer than usual.
    await t.expect(downloadStatus.innerText).eql('measuring', { timeout: 10000 });
    await t.expect(download.innerText).notEql('');

    // The download test takes 10 seconds, so we expect downloadStatus to
    // become "complete" within 15s at most.
    await t.expect(downloadStatus.innerText).eql('complete', { timeout: 15000 });
    await t.expect(download.innerText).notEql('');

    // The same 10-second timeout as above is used for the client to connect
    // for the upload test.
    await t.expect(uploadStatus.innerText).eql('measuring', { timeout: 10000 });
    await t.expect(upload.innerText).notEql('');

    // The upload test takes 10 seconds, so we expect uploadStatus to
    // become "complete" within 15s at most.
    await t.expect(uploadStatus.innerText).eql('complete', { timeout: 15000 });
    await t.expect(upload.innerText).notEql('');

    // The error div should be empty.
    await t.expect(Selector('#error').innerText).eql('');

});
