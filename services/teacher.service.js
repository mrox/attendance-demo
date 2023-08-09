const _ = require('lodash');
const {_getGoogleSheetClient, _readGoogleSheet} = require('./sheet.service');
const {SHEET_ID} = require('../config');
const { addTokenToTopic, removeTokenFromTopic } = require('./notification.service');
const tabName = 'GV'
let teacherList = []
let adminList = []
let classList = []
let emailList = new Map();
async function getTeachers() {
    console.log(`Get teachers`);
    const data = await _readGoogleSheet(tabName);
    const teachers = [];
    const admins = []
    const classes = []
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
                class: e[3].split(",").map(e => e.trim().toUpperCase()),
                token: e[4],
                notiApp: e[5] === 'TRUE' ? true : false,
                notiEmail: e[6] === 'TRUE' ? true : false,
            }
            teachers.push(teacher);
            classes.push(...teacher.class)
            // console.log(teacher.class);
            if(teacher.class.includes('ADMIN')){
                admins.push(teacher)
            }
        }
    });
    teacherList = teachers
    adminList = admins
    classList = _.union(classes)
    classList.forEach((e) => {
        emailList.set(e, teachers.filter(t => t.notiEmail && t.class.includes(e)).map(t => t.email))
    })
    // console.log(emailList);
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
        const data = await _readGoogleSheet(tabName);
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
    getTeachers()
}

async function updateTeacherByEmail(newTeacher) {
    let updateResult ;
    const teachers = await getTeachers();

    const teacher = teachers.find(e => e.email == newTeacher.email);
    if (teacher) {
        await unSubTopics(teacher.token, teacher.class);
        await addTokenToTopic(newTeacher.token, newTeacher.class.split(",").map(e => e.trim().toUpperCase()));
        const data = await _readGoogleSheet( tabName);
        const row = data.findIndex(e => e[2] == teacher.email);
        const column = 1;
        const updateRange = `${tabName}!${String.fromCharCode(65 + column)}${row + 1}`;
        const updateValue = [[newTeacher.name, newTeacher.email, newTeacher.class, newTeacher.token, newTeacher.notiApp, newTeacher.notiEmail]];
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
        await addTokenToTopic(newTeacher.token, newTeacher.class.split(",").map(e => e.trim().toUpperCase()));
        const googleSheetClient = await _getGoogleSheetClient();
        const data = await _readGoogleSheet(tabName);
        const row = data.length;
        const column = 0;
        const updateRange = `${tabName}!${String.fromCharCode(65 + column)}${row+1}`;
        const updateValue = [[data.length,newTeacher.name, newTeacher.email, newTeacher.class, newTeacher.token, newTeacher.notiApp, newTeacher.notiEmail]];
        const updateBody = {
            values: updateValue
        }
         updateResult = await googleSheetClient.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: updateRange,
            valueInputOption: 'USER_ENTERED',
            resource: updateBody
        });
    }
    getTeachers()
    return updateResult;
}

const getTecherByClass = (classId) => {
    const teachers = teacherList.filter(e => e.class.includes(classId));
    return teachers;
}

const unSubTopics = async (token , topics) => {
    for (const c of topics) {
        await removeTokenFromTopic(token, c)
    }
}

module.exports = {
    teacherList,
    adminList,
    classList,
    emailList,
    getTeachers,
    getTeacherByEmail,
    updateTeacherTokenByEmail,
    updateTeacherByEmail,
    getTecherByClass
}