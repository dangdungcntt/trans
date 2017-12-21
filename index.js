const translate = require('google-translate-api');
const express = require('express');
const bodyParser = require('body-parser');
const cors  = require('cors');
const https = require('https');
const fs = require('fs')
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Welcome to Express');
})

app.post('/vi2vi', (req, res) => {
  console.log(req.body);
  if (!req.body.text) {
    return res.status(400).json({
      msg: 'please send with "text" param'
    });
  }
  const text = req.body.text;
  translate(text, { from: 'vi', to: 'vi' }).then(data => {
    if (data.from.text.didYouMean) {
      return res.status(200).json({
        text: data.from.text.value.split('[').join('').split(']').join('')
      });
    }
    return res.status(200).json({
      text
    });
  }).catch(err => {
    return res.status(400).json({
      msg: 'Cannot get text'
    });
  });
})

const port = process.env.PORT || 3000;

if (process.env.NODE_ENV && process.env.NODE_ENV == 'production') {
  app.listen(port, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log('RUNNING ON PORT ' + port)
  });
} else { 
  const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
  }
  https.createServer(httpsOptions, app).listen(port, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log('RUNNING ON PORT ' + port)
  });
}