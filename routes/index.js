const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path'); 

router.use(express.json());

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Data-Logger' });
});

router.post('/record', function(req, res, next) {
  const now = new Date();
  const datos = req.body;
  
  const mesActual = now.getMonth() + 1; 
  
  const logfile_name = path.join(__dirname, '../public/logs/', datos.id_nodo + "-" + now.getFullYear() + "-" + mesActual + "-" + now.getDate() + '.csv');

  fs.stat(logfile_name, function(err, stat) {
    if(err == null) {
        console.log('File %s exists', logfile_name);
        let content = datos.id_nodo + ';' + now.getTime() + ";" + datos.temperatura + ";" + datos.humedad + ";" + datos.co2 + ";" + datos.volatiles + "\r\n";
        append2file(logfile_name, content);
    } else if(err.code === 'ENOENT') {
        let content = 'id_nodo; timestamp; temperatura; humedad; CO2; volatiles\r\n' + datos.id_nodo + ';' + now.getTime() + ";" + datos.temperatura + ";" + datos.humedad + ";" + datos.co2 + ";" + datos.volatiles + "\r\n";
        append2file(logfile_name, content);
    } else {
        console.log('Some other error: ', err.code);
    }
  });

  res.send("Datos recibidos por POST y procesados.");
});


router.get('/record', function(req, res, next) {
  const now = new Date();
  const mesActual = now.getMonth() + 1;

  const logfile_name = path.join(__dirname, '../public/logs/', req.query.id_nodo + "-" + now.getFullYear() + "-" + mesActual + "-" + now.getDate() + '.csv');

  fs.stat(logfile_name, function(err, stat) {
    if(err == null) {
        console.log('File %s exists', logfile_name);
        let content = req.query.id_nodo + ';' + now.getTime() + ";" + req.query.temperatura + ";" + req.query.humedad + ";" + req.query.co2 + ";" + req.query.volatiles + "\r\n";
        append2file(logfile_name, content);
        
    } else if(err.code === 'ENOENT') {
        let content = 'id_nodo; timestamp; temperatura; humedad; CO2; volatiles\r\n' + req.query.id_nodo + ';' + now.getTime() + ";" + req.query.temperatura + ";" + req.query.humedad + ";" + req.query.co2 + ";" + req.query.volatiles + "\r\n";
        append2file(logfile_name, content);
    } else {
        console.log('Some other error: ', err.code);
    }
  });

  res.send("Saving: " + req.query.id_nodo + ';' + now.getTime() + ";" + req.query.temperatura + ";" + req.query.humedad + ";" + req.query.co2 + ";" + req.query.volatiles + " in: " + logfile_name);
});


function append2file(file2append, content){
  fs.appendFile(file2append, content, function (err) {
    if (err) throw err;
    console.log("Saving: " + content + " in: " + file2append);
  });
}

module.exports = router;
