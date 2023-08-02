const { google } = require('googleapis');
const moment = require('moment');
const serviceAccountKeyFile = "./attendance-394502-807890f51e2a.json";
const sheetId = '1dRH0Sk1OY-mOvB6cX001zBj5A2TtO1d4nPY_BUAJ8K4'
const tabName = 'Lớp vẽ'
const range = 'A:L'
const {updateTeacherByEmail} = require('./services/teacher.service.js');
const attendance = require('./services/attendance.service.js');
const teachers = require('./services/teacher.service.js');

const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express()
const port = 3000
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
    origin: '*'
}));

teachers.getTeachers();
attendance.start();
// async function main() {
//     // const tuyen = {
//     //     id: "1",
//     //     name: "TuyenTT",
//     //     email: "tuyen.appdev@gmail.com",
//     //     class: ["Lớp vẽ", "Lớp học thử"],
//     //     token: "1234567"
//     // }
//     // await updateTeacherByEmail(tuyen);
//     // const teachers = await getTeachers();
//     // Generating google sheet client
//     const googleSheetClient = await _getGoogleSheetClient();

//     // Reading Google Sheet from a specific range
//     const data = await _readGoogleSheet(googleSheetClient, sheetId, tabName, range);
//     // console.log(data);
//     let fullData = {};
//     data.values.forEach((e, row) => {
//         if(row == 0){
//             e.forEach((e1, column) => {
//                 if(moment(e1, "MM/DD/YYYY", true).isValid()){
//                     const columnDate = moment(e1, "MM/DD/YYYY");
//                     const today = moment(new Date()).startOf("D")
//                     console.log(columnDate, today);
//                     if(columnDate.isSame(today)){
//                         const time = data.values[row +1][column];
//                         const students = []
//                         for(i = 2; i < data.values.length; i++){
//                             const student = {
//                                 id: data.values[i][0],
//                                 name: data.values[i][1],
//                                 class: data.values[i][2],
//                                 status: data.values[i][column]
//                             }
//                             students.push(student);
//                         }
//                         console.log(time, students);
//                     }
//                 }
                
//             })
//         }

//     });
//     // console.log(fullData);   
// }

// async function _getGoogleSheetClient() {
//     const auth = new google.auth.GoogleAuth({
//         keyFile: serviceAccountKeyFile,
//         scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//     });
//     const authClient = await auth.getClient();
//     return google.sheets({
//         version: 'v4',
//         auth: authClient,
//         majorDimension: "COLUMNS"
//     });
// }

// async function _readGoogleSheet(googleSheetClient, sheetId, tabName, range) {
//     const res = await googleSheetClient.spreadsheets.values.get({
//         spreadsheetId: sheetId,
//         range: tabName//`${tabName}!${range}`,
//     });

//     return res.data;
// }

// async function _findGoogleSheet(googleSheetClient, sheetId, tabName, range) {
//     const res = await googleSheetClient.spreadsheets.values.get({
//         spreadsheetId: sheetId,
//         range: `${tabName}!${range}`,
//     });

//     return res.data;
// }

// async function _writeGoogleSheet(googleSheetClient, sheetId, tabName, range, data) {
//     await googleSheetClient.spreadsheets.values.append({
//         spreadsheetId: sheetId,
//         range: `${tabName}!${range}`,
//         valueInputOption: 'USER_ENTERED',
//         insertDataOption: 'INSERT_ROWS',
//         resource: {
//             "majorDimension": "ROWS",
//             "values": data
//         },
//     })
// }

app.post('/api/teachers', async (req, res) => {
    const teacher = req.body;
    await updateTeacherByEmail(teacher);
    res.send(teacher);
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})