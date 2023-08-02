const { google } = require('googleapis');

const serviceAccountKeyFile = "./attendance-394502-807890f51e2a.json";
const sheetId = '1dRH0Sk1OY-mOvB6cX001zBj5A2TtO1d4nPY_BUAJ8K4'

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

async function _readGoogleSheet(googleSheetClient, sheetId, tabName, range) {
    const res = await googleSheetClient.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `${tabName}!${range}`,
    });

    return res.data.values;
}

module.exports = {
    _getGoogleSheetClient,
    _readGoogleSheet
}