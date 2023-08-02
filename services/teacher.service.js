const { google } = require('googleapis');
const {_getGoogleSheetClient, _readGoogleSheet} = require('./sheet.service');
const sheetId = '1dRH0Sk1OY-mOvB6cX001zBj5A2TtO1d4nPY_BUAJ8K4'
const tabName = 'GV'
const range = 'A:E'
let teacherList = []

async function getTeachers() {
    console.log(`Get teachers`);
    const googleSheetClient = await _getGoogleSheetClient();
    const data = await _readGoogleSheet(googleSheetClient, sheetId, tabName, range);
    const teachers = [];
    if (!data) {
        console.log('No data found.');
        return [];
    }
    data.forEach((e, row) => {
        if (row > 0) {
            const teacher = {
                id: e[0],
                name: e[1],
                email: e[2],
                class: e[3].split(",").map(e => e.trim()),
                token: e[4],
            }
            teachers.push(teacher);
        }
    });
    teacherList = teachers
    return teachers;
}

async function getTeacherByEmail(email) {
    const teachers = await getTeachers();
    const teacher = teachers.find(e => e.email == email);
    return teacher;
}

async function updateTeacherTokenByEmail(email, token) {
    const teachers = await getTeachers();
    const teacher = teachers.find(e => e.email == email);
    if (teacher) {
        teacher.token = token;
        const googleSheetClient = await _getGoogleSheetClient();
        const data = await _readGoogleSheet(googleSheetClient, sheetId, tabName, range);
        const row = data.findIndex(e => e[2] == email);
        const column = 4;
        const updateRange = `${tabName}!${String.fromCharCode(65 + column)}${row + 1}`;
        const updateValue = [[token]];
        const updateBody = {
            values: updateValue
        }
        const updateResult = await googleSheetClient.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            resource: updateBody
        });
        console.log(updateResult);
    }
}

async function updateTeacherByEmail(newTeacher) {
    let updateResult ;
    const teachers = await getTeachers();

    const teacher = teachers.find(e => e.email == newTeacher.email);
    if (teacher) {
        const googleSheetClient = await _getGoogleSheetClient();
        const data = await _readGoogleSheet(googleSheetClient, sheetId, tabName, range);
        const row = data.findIndex(e => e[2] == teacher.email);
        const column = 1;
        const updateRange = `${tabName}!${String.fromCharCode(65 + column)}${row + 1}`;
        const updateValue = [[newTeacher.name, newTeacher.email, newTeacher.class, newTeacher.token]];
        const updateBody = {
            values: updateValue
        }
         updateResult = await googleSheetClient.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            resource: updateBody
        });

    }
    else {
        const googleSheetClient = await _getGoogleSheetClient();
        const data = await _readGoogleSheet(googleSheetClient, sheetId, tabName, range);
        const row = data.length;
        const column = 0;
        const updateRange = `${tabName}!${String.fromCharCode(65 + column)}${row+1}`;
        const updateValue = [[data.length,newTeacher.name, newTeacher.email, newTeacher.class, newTeacher.token]];
        const updateBody = {
            values: updateValue
        }
         updateResult = await googleSheetClient.spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            resource: updateBody
        });
    }
    return updateResult;
}

const getTecherByClass = (classId) => {
    const teachers = teacherList.filter(e => e.class.includes(classId));
    return teachers;
}
module.exports = {
    teacherList,
    getTeachers,
    getTeacherByEmail,
    updateTeacherTokenByEmail,
    updateTeacherByEmail,
    getTecherByClass
}