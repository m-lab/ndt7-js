import { Selector } from 'testcafe';

fixture `Getting Started`
    .page `http://localhost:5000`;

const server = Selector('#server');
const downloadStatus = Selector('#downloadStatus');
const download = Selector('#download');
const uploadStatus = Selector('#uploadStatus');
const upload = Selector('#upload');

test('Basic functionality tests', async t => {
    // Wait to make sure a server has been received from Locate.
    await t.wait(2000);
    await t.expect(server.innerText).notEql('');

    // We're in the middle of the download test, so these divs should be populated.
    await t.expect(downloadStatus.innerText).eql('measuring');
    await t.expect(download.innerText).notEql('');

    // Wait 10 seconds to make sure the upload has started.
    await t.wait(10000);
    await t.expect(downloadStatus.innerText).eql('complete');
    await t.expect(download.innerText).notEql('');
    await t.expect(uploadStatus.innerText).eql('measuring');
    await t.expect(upload.innerHtml).notEql('');

});