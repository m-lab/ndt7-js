import { Selector } from 'testcafe';

fixture `Test ndt7-js client`
    .page `http://localhost:5000`;

const server = Selector('#server');
const downloadStatus = Selector('#downloadStatus');
const download = Selector('#download');
const uploadStatus = Selector('#uploadStatus');
const upload = Selector('#upload');

test('Basic functionality tests', async t => {
    // The assertion timeout is set to 20 seconds, so notEql() will wait until
    // the server div becomes non-empty. This allows more time for slower
    // connections and mobile devices to connect to the Locate service.
    await t.expect(server.innerText).notEql('', { timeout: 20000 });

    // We're in the middle of the download test, so these divs should be
    // populated. A 20-second timeout is used here as well, to handle cases
    // where connecting to the server takes longer than usual.
    await t.expect(downloadStatus.innerText).eql('measuring', { timeout: 20000 });
    await t.expect(download.innerText).notEql('');

    // The download test takes 10 seconds, so we expect downloadStatus to
    // become "complete" within 30s at most to account for mobile devices.
    await t.expect(downloadStatus.innerText).eql('complete', { timeout: 30000 });
    await t.expect(download.innerText).notEql('');

    // The same 20-second timeout as above is used for the client to connect
    // for the upload test.
    await t.expect(uploadStatus.innerText).eql('measuring', { timeout: 20000 });
    await t.expect(upload.innerText).notEql('');

    // The upload test takes 10 seconds, so we expect uploadStatus to
    // become "complete" within 30s at most to account for mobile devices.
    await t.expect(uploadStatus.innerText).eql('complete', { timeout: 30000 });
    await t.expect(upload.innerText).notEql('');

    // The error div should be empty.
    await t.expect(Selector('#error').innerText).eql('');

});
