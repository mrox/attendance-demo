
const moment = require('moment');
const {_readGoogleSheet, _getGoogleSheetClient} = require('./sheet.service');
const {getTecherByClass, teacherList} = require('./teacher.service');
const { sendNotificationToDevice } = require('./notification.service');
const sheetId = '1dRH0Sk1OY-mOvB6cX001zBj5A2TtO1d4nPY_BUAJ8K4'
const tabName = 'Lớp vẽ'
const range = 'A:L'
const notiList = new Map();


const start = async () => {
    // Start attendance service
    const data = await getAttendance(tabName);
    data.forEach((e) => {
        if(e.status == "Vắng"){
            const notiId = e.id + e.class + moment(new Date()).startOf("D").format("DDMMYYYY");

            if(!notiList.has(notiId)){
                teachers = getTecherByClass(e.class);
                console.log(`Teacher of ${e.class}: ${teachers.join(", ")}}`);
                if(teachers.length > 0)
                {
                    notiList.set(notiId, true);
                    teachers.forEach((t) => {
                        console.log("Send notification to " + e.name);
                        console.log(t);
                        if(t.token && t.token.length > 0)
                            sendNotificationToDevice(t.token, "Thông báo", `Bạn có học sinh vắng: ${e.name} `, {type: "attendance"});
                    })
                }
            }

        }
            
    })
    //


    console.log(data);
    // console.log(fullData);   

}

const getAttendance = async (sheet) => {
    const googleSheetClient = await _getGoogleSheetClient();

    // Reading Google Sheet from a specific range
    const data = await _readGoogleSheet(googleSheetClient, sheetId, sheet, range);
    const students = []
    data.forEach((e, row) => {
        if(row == 0){
            e.forEach((e1, column) => {
                if(moment(e1, "MM/DD/YYYY", true).isValid()){
                    const columnDate = moment(e1, "MM/DD/YYYY");
                    const today = moment(new Date()).startOf("D")
                    if(columnDate.isSame(today)){
                        const time = data[row +1][column];
                        const timeStart = moment(time.split("-")[0], "HH:mm");
                        const timeEnd = moment(time.split("-")[1], "HH:mm");
                        const now = moment(new Date());
                        if(now.isBetween(timeStart, timeEnd)){
                            for(i = 2; i < data.length; i++){
                                const student = {
                                    id: data[i][0],
                                    name: data[i][1],
                                    class: data[i][2],
                                    status: data[i][column]
                                }
                                students.push(student);
                            }
                        }
                        
                    }
                }
                
            })
        }
    });
    return students;
}

setInterval(async () => {
    await start();
}, 60000);

module.exports = {
    start,
    getAttendance
}