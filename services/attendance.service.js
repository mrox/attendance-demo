
const moment = require('moment');
const { _readGoogleSheet, _getSheets } = require('./sheet.service');
const { sendNotificationToTopic } = require('./notification.service');
const { sendNotificationEmail, sendEmailToTopic } = require('./email.service');

const notiList = new Map();
global.notiList = new Map();

const start = async () => {
    // Start attendance service
    const sheets = await _getSheets();
    if (sheets.length <= 1) return;
    for (const s of sheets) {
        if (s.properties.title === 'GV') continue;
        const data = await getAttendance(s.properties.title);

    }

}

const getAttendance = async (sheet) => {
    console.log(`Thc hien diem danh lớp:`, sheet);

    const data = await _readGoogleSheet(sheet);
    const students = []
    data.forEach((e, row) => {
        if (row == 0) {
            e.forEach(async (e1, column) => {
                if (moment(e1, "MM/DD/YYYY", true).isValid()) {
                    const columnDate = moment(e1, "MM/DD/YYYY");
                    const today = moment(new Date()).startOf("D")
                    if (columnDate.isSame(today)) {
                        const time = data[row + 1][column];
                        const timeStart = moment(time.split("-")[0], "HH:mm");
                        const timeEnd = moment(time.split("-")[1], "HH:mm");
                        const now = moment(new Date());
                        if (now.isBetween(timeStart, timeEnd)) {

                            console.log(`Đang kiểm tra điểm danh lớp ${sheet}, thời gian: ${moment(timeStart).format("HH:mm")} - ${moment(timeEnd).format("HH:mm")}}`);
                            let studentsStatus = {
                                late: 0,
                                absent: 0,
                                onTime: 0,
                                absendKnown: 0,
                                unknown: 0
                            }
                            let sendLateAttendance = false

                            for (i = 2; i < data.length; i++) {
                                const student = {
                                    id: data[i][0],
                                    name: data[i][1],
                                    class: data[i][2]?.toUpperCase(),
                                    status: data[i][column]
                                }
                                if (!student.status) {
                                    sendLateAttendance = true;
                                    studentsStatus.unknown++;
                                }
                                else if (student.status == "Vắng") {
                                    studentsStatus.absent++
                                    sendNotiToTeacher(sheet, student, timeStart, studentsStatus)
                                }
                                else if (student.status == "Vào muộn") studentsStatus.late++;
                                else if (student.status == "Có mặt") studentsStatus.onTime++;
                                else if (student.status == "Vắng có phép") studentsStatus.absendKnown++;

                                students.push(student);
                            }
                            if (sendLateAttendance && now.isAfter(timeStart.add(10, "m"))) {
                                sendNotiToAdmin(sheet, timeStart, studentsStatus)
                            }
                        }


                    }
                }
                else return []
            })
        }
    });
    return students;
}

const sendNotiToAdmin = async (sheet, timeStart, status) => {
    console.log(``);
    console.log(`====== ${sheet}: ${moment(timeStart).format("HH:mm MM/DD")}======`);
    console.log("|  sendLateAttendance to admin");
    console.log(`|  Lớp: ${sheet} chưa hoàn thành thực hiện điểm danh`);
    console.log(`|  Thời gian: ${timeStart.format("HH:mm")}`);
    console.log(`|  Số lượng học sinh:`);
    console.log(`|      Vắng: ${status.absent}`);
    console.log(`|      Vắng có phép: ${status.absendKnown}`);
    console.log(`|      Vào muộn: ${status.late}`);
    console.log(`|      Có mặt: ${status.onTime}`);
    console.log(`|      Chưa điểm danh: ${status.unknown}`);
    console.log("====================================");
    console.log(``);
    console.log(``);
    console.log(``);

    const id = sheet + timeStart.format("DDMMYYYYhhmm");
    if (notiList.has(id)) return;

    notiList.set(id, true)
    try {

        await sendNotificationToTopic(
            "ADMIN", "Thông báo",
            `Lớp ${sheet} chưa hoàn thành thực hiện điểm danh, số lượng học sinh chưa điểm danh: ${status.unknown}`,
            { type: "attendance" },
            "https://attendance.jmt.vn"
        );
        await sendEmailToTopic(
            "ADMIN",
            {
                subject: `Lớp ${sheet} chưa hoàn thành thực hiện điểm danh`,
                html: `<p>
                        <b>Thông tin điểm danh lúc ${moment().format("HH:mm DD/MM/YYYY")}<b>
                        <br>
                        <b>Lớp: ${sheet}</b>
                        <br>
                        <b>Thời gian: ${timeStart.format("HH:mm")}</b>
                        <br>
                        <b>Số lượng học sinh:</b>
                        <br>
                        <b>Vắng: ${status.absent}</b>
                        <br>
                        <b>Vắng có phép: ${status.absendKnown}</b>
                        <br>
                        <b>Vào muộn: ${status.late}</b>
                        <br>
                        <b>Có mặt: ${status.onTime}</b>
                        <br>
                        <b>Chưa điểm danh: ${status.unknown}</b>
    
                    </p>`,
                text: `
                        Thông tin điểm danh lúc ${moment().format("HH:mm DD/MM/YYYY")}
                        Lớp: ${sheet}
                        Thời gian: ${timeStart.format("HH:mm")}
                        Số lượng học sinh:
                        Vắng: ${status.absent}
                        Vắng có phép: ${status.absendKnown}
                        Vào muộn: ${status.late}
                        Có mặt: ${status.onTime}
                        Chưa điểm danh: ${status.unknown}
                    `
            }
        );
    } catch (error) {
        console.log(error);
    }

    //         if(v.token && v.token.length > 0){
    //             notiList.set(id, true)
    //             sendNotificationToDevice(v.token, "Thông báo", `Lớp: ${sheet} chưa thực hiện điểm danh`, {type: "attendance_late"});
    //         }
    // })
    //TODO: send email, notification


}

const sendNotiToTeacher = async (sheet, student) => {
    const notiId = sheet + student.class + moment(new Date()).startOf("D").format("DDMMYYYY") + student.name;
    if (notiList.has(notiId)) return;
    notiList.set(notiId, student);
    try {

        sendNotificationToTopic(
            student.class.toUpperCase(), "Thông báo",
            `Bạn có học sinh vắng: ${student.name} lớp ${sheet} `,
            { type: "attendance" },
            "https://attendance.jmt.vn"
        );
        sendEmailToTopic(
            student.class.toUpperCase(),
            {
                subject: "Thông báo vắng học",
                html: `<p>Bạn có học sinh vắng: ${student.name} lớp ${sheet} </p>`,
                text: `Bạn có học sinh vắng: ${student.name} lớp ${sheet} `
            }
        );
    } catch (error) {
        console.log(error);
    }
}

setInterval(async () => {
    try {
        await start();

    } catch (error) {
        console.log(error);
    }
}, 60000);

module.exports = {
    start,
    getAttendance
}