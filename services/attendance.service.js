
const moment = require('moment');
const {_readGoogleSheet, _getGoogleSheetClient} = require('./sheet.service');
const {getTecherByClass, teacherList, adminList} = require('./teacher.service');
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
                console.log(`Teacher of ${e.class}: ${teachers.map(tc => tc.email).join(",")}`);
                if(teachers.length > 0)
                {
                    notiList.set(notiId, true);
                    teachers.forEach((t) => {
                        console.log("Send notification to " + t.email);
                        // console.log(t);
                        if(t.token && t.token.length > 0)
                            sendNotificationToDevice(t.token, "Thông báo", `Bạn có học sinh vắng: ${e.name} `, {type: "attendance"});
                    })
                }
            }

        }
            
    })
    //


    // console.log(data);
    // console.log(fullData);   

}

const getAttendance = async (sheet) => {
    const googleSheetClient = await _getGoogleSheetClient();

    // Reading Google Sheet from a specific range
    const data = await _readGoogleSheet(googleSheetClient, sheetId, sheet, range);
    const students = []
    const notiLate = false
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
                        console.log(timeStart, timeEnd, now);
                        //Gửi noti cho admin khi quá 10 phút mà chưa điểm danh
                       
                        let sendLateAttendance = false
                        if(now.isBetween(timeStart, timeEnd)){
                            for(i = 2; i < data.length; i++){
                                const student = {
                                    id: data[i][0],
                                    name: data[i][1],
                                    class: data[i][2].toUpperCase(),
                                    status: data[i][column]
                                }
                                if(!student.status) sendLateAttendance = true;
                                students.push(student);
                            }
                        }
                        if(sendLateAttendance && now.isAfter(timeStart.add(10, "m"))){
                            sendNotiToAdmin(sheet)
                        }
                        
                    }
                }
                
            })
        }
    });
    return students;
}

const sendNotiToAdmin = async (sheet)=> {
    console.log("sendLateAttendance");
    console.log(`admin: `, adminList);
    adminList.forEach(v => {
        // console.log(v);
        const id = v.email + sheet + moment(new Date()).format("DDMMYYYY");
        if(!notiList.has(id))
            if(v.token && v.token.length > 0){
                notiList.set(id, true)
                sendNotificationToDevice(v.token, "Thông báo", `Lớp: ${sheet} chưa thực hiện điểm danh`, {type: "attendance_late"});
            }
    })

}

setInterval(async () => {
    await start();
}, 60000);

module.exports = {
    start,
    getAttendance
}