require("dotenv").config();
const translate = require("@vitalets/google-translate-api");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to Express");
});

app.post("/vi2vi", (req, res) => {
  if (!req.body.text) {
    return res.status(400).json({
      msg: 'please send with "text" param',
    });
  }
  const text = req.body.text;
  translate(text, { from: "vi", to: "vi" })
    .then((data) => {
      if (data.from.text.didYouMean) {
        return res.status(200).json({
          text: data.from.text.value.split("[").join("").split("]").join(""),
        });
      }
      return res.status(200).json({
        text,
      });
    })
    .catch((err) => {
      console.log(err);
      return res.status(400).json({
        msg: "Cannot get text",
      });
    });
});

const port = process.env.PORT || 3000;
const host = process.env.LISTEN_HOST || "0.0.0.0";

if (process.env.APP_ENV == "production") {
  app.listen(port, host, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log(`${process.env.APP_ENV} - RUNNING ON PORT ${host}:${port}`);
  });
} else {
  const httpsOptions = {
    key: fs.readFileSync("./key.pem"),
    cert: fs.readFileSync("./cert.pem"),
  };
  https.createServer(httpsOptions, app).listen(port, host, (err) => {
    if (err) {
      return console.log(err);
    }
    console.log(`${process.env.APP_ENV} - RUNNING ON PORT ${host}:${port}`);
  });
}

process.on("SIGINT", function () {
  process.exit();
});
