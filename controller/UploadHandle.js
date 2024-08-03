const path = require("path");
const fs = require("fs");
const { uploadFileLog } = require('../extra/Logging')


const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const UploadHandle = (req, res) => {

  const tempPath = req.file.path;

  let originalname = req.file.originalname
  let fakename = btoa(encodeURIComponent(originalname));
  const targetPath = path.join(__dirname, `../tmp/resource/${fakename}`);
  fs.rename(tempPath, targetPath, err => {
    if (err) return handleError(err, res);
    res
      .status(200)
      .contentType("text/plain")
      .json("File uploaded!");
  });

  // log
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress
  ip = ip.replace(/::ffff:/, '');

  uploadFileLog(ip, originalname)

}

module.exports = UploadHandle