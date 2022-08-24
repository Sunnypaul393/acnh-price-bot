const { GoogleSpreadsheet } = require('google-spreadsheet');

let fs = require('fs');
const { Twilio } = require('twilio');
const { AssignedAddOnInstance } = require('twilio/lib/rest/api/v2010/account/incomingPhoneNumber/assignedAddOn');
let credsFile = Runtime.getAssets()['/creds.json'].path;
let creds = JSON.parse(fs.readFileSync(credsFile, 'utf8'));

async function getCritter(critterName) {

    const doc = new GoogleSpreadsheet('1hbEOKDxZoeK0I_RRLhBNZ0ke8vnI6S4gpyQMV9crrCs');
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();

    const bugSheet = doc.sheetsByIndex[0];
    const fishSheet = doc.sheetsByIndex[1];

    const bugs = await bugSheet.getRows();
    const fish = await fishSheet.getRows();

    const rows = bugs.concat(fish);

    const critter = rows.filter(row => row.Name.toLowerCase() === critterName.toLowerCase().trim())[0];

    return critter;

}

exports.handler = async function(context, event, callback) {
    const twiml = new Twilio.twiml.MessagingResponse();
    const critterName = event.Body.trim();

    const critter = await getCritter(critterName);

    if (critter) {
        twiml.message('The price of your ${event.Body} is: ${critter.Price} bells.');
    } else {
        twiml.message('Sorry, I cant find a price for ${event.Body}. Please try again.')
    }

    callback(null, twiml);
}