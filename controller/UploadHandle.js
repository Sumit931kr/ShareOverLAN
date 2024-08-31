const path = require("path");
const fs = require("fs");
const { uploadFileLog } = require('../extra/Logging')
const mv = require('mv');


// Determine the appropriate directory for file uploads
const resourceDir = process.pkg 
  ? path.resolve(process.execPath, '..', 'tmp', 'resource')
  : path.join(__dirname, '..', 'tmp', 'resource');

// Ensure the resource directory exists
if (!fs.existsSync(resourceDir)) {
  fs.mkdirSync(resourceDir, { recursive: true });
}

const handleError = (err, res) => {
  console.log("file upload error");
  console.log(err);
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

const UploadHandle = (req, res) => {
  const tempPath = req.file.path;
  let originalname = req.file.originalname;
  let fakename = btoa(encodeURIComponent(originalname));
  const targetPath = path.join(resourceDir, fakename);

  mv(tempPath, targetPath, { mkdirp: true }, err => {
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
  uploadFileLog(ip, originalname);
};

module.exports = UploadHandle
