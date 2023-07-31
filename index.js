const express = require('express')
const app = express()
const port = 3000

app.get('*', (req, res) => {
  
  console.log(req.body);
  console.log(req.params);
  console.log(req.query);
  res.send({})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})