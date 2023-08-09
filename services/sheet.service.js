const { google } = require('googleapis');
const {SHEET_ID} = require('../config');
const serviceAccountKeyFile = "./attendance-394502-807890f51e2a.json";

async function _getGoogleSheetClient() {
    const auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountKeyFile,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const authClient = await auth.getClient();

    return google.sheets({
        version: 'v4',
        auth: authClient,
    });
}

async function _readGoogleSheet( tabName ) {
    const googleSheetClient = await _getGoogleSheetClient();
    const res = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range:tabName,
    });

    return res.data.values;
}

async function _getSheets(){
    const googleSheetClient = await _getGoogleSheetClient();
    const res = await googleSheetClient.spreadsheets.get({
        spreadsheetId: SHEET_ID,
    })
    return res.data.sheets
}

module.exports = {
    _getSheets,
    _getGoogleSheetClient,
    _readGoogleSheet
}