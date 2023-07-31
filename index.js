const express = require('express')
const bodyParser = require('body-parser');

const app = express()
const port = 3000
app.use(bodyParser.urlencoded({ extended: true }));

app.post('*', (req, res) => {
  
  console.log(req.body);
  console.log(req.params);
  console.log(req.query);
  res.send({})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})