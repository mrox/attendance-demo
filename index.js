
const {updateTeacherByEmail} = require('./services/teacher.service.js');
const attendance = require('./services/attendance.service.js');
const teachers = require('./services/teacher.service.js');
const path = require('path');

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


app.post('/api/teachers', async (req, res) => {
    const teacher = req.body;
    await updateTeacherByEmail(teacher);
    res.send(teacher);
});

app.get('/api/teachers/notification', async (req, res) => {
    const notis = global.notiList?.get(req.query['email'])
    res.send(notis);
});


// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, 'dist')));


// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });

app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)

    await teachers.getTeachers();
    attendance.start();

})
