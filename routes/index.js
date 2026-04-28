const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path'); 
const mqtt = require('mqtt');

router.use(express.json());

const mqttClient = mqtt.connect('mqtt:/localhost:1883');
mqttClient.on('connect', () => {
	console.log('Connected to MQTT broker');
});

mqttClient.on('error',(err) => {
	console.log('MQTT Error:', err.message);
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Data-Logger' });
});

router.post('/record', function(req, res, next) {
  const now = new Date();
  const datos = req.body;
  
  const mensajeMQTT = {
	  id_nodo: datos.id_nodo,
	  timestamp: now.getTime(),
	  temperatura: datos.temperatura,
	  humedad: datos.humedad,
	  co2: datos.co2,
	  volatiles: datos.volatiles
  };
  mqttClient.publish('sensores/datos', JSON.stringify(mensajeMQTT), (err) => {
	  if (err){
		  console.log('Error al publicar en MQTT:', err.message);
	  } else {
		  console.log('Publicado en MQTT:', JSON.stringify(mensajeMQTT));
	  }
  });
		  
  const mesActual = now.getMonth() + 1; 
  
  const logfile_name = path.join(__dirname, '../public/logs/', datos.id_nodo + "-" + now.getFullYear() + "-" + mesActual + "-" + now.getDate() + '.csv');
  const mensajeMQTTBACK = {
	id_nodo: req.query.id_nodo,
	timestamp: now.getTime(),
	temperatura: req.query.temperatura,
	humedad: req.query.humedad,
	co2: datos.co2,
	volatiles: req.query.volatiles
  };
  
  mqttClient.publish('sensores/datos', JSON.stringify(mensajeMQTT), (err) => {
	  if (err){
		  console.log('Error al publicar en MQTT:');
	  } else {
		  console.log('Publicado en MQTT:', JSON.stringify(mensajeMQTT)); //mirar x si es el mensajeMQTTBACK, nsure
	  }
  });
  
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
