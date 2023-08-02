//https://github.com/reelyactive/advlib-ble-manufacturers
//https://github.com/reelyactive/advlib-ble-services

const express = require('express')
const bodyParser = require('body-parser');
const e = require('express');
const mBeaconParser = require('./lib/parser.js');
// const advlib = require('advlib-ble-services');
const advlib = require('advlib-ble-manufacturers');

const app = express()
const port = 3000
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('*', (req, res) => {
  // console.log(req.body);
  if(req.body.length > 0)
    req.body.forEach(e => {
      // if(e.mac === "00D279F17E2B"){
        console.log(e);
        
        // if(e.rawData){

        //   let companyCode = 0x004c;
        //   let manufacturerData = e.rawData;

        //   let processedData = advlib.processManufacturerSpecificData(companyCode,
        //                                                             manufacturerData);

        //   // console.log(mBeaconParser.parse(e.data));
        //   // let uuid = 'ffe1';
        //   // let serviceData = e.rawData;
        //   // let processedData = advlib.processServiceData(uuid, serviceData);
        //   if(processedData !== null){
        //     console.log(e);
        //     console.log(processedData);
        //   }
        // }
      })
    // console.log(e.);
  // });
  // console.log(req.body);
  // console.log(req.f)
  // console.log(req.params);
  // console.log(req.query);
  res.send("OK")
})

app.get('*', (req, res) => {
  
  console.log(req.params);
  console.log(req.query);
  res.send("OK")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})