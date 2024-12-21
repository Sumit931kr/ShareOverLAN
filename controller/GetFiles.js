const fs = require("fs");
const { getFileLog } = require('../extra/Logging')

function isBase64(str) {
  try {
    // Attempt to decode and encode to validate the string
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}


const GetFiles = (req, res) => {
  let resObjArr = [];
  fs.readdir('./tmp/resource', (err, files) => {

    files.forEach(file => {
      let obj = {}
      let stats = fs.statSync("./tmp/resource/" + file)
      //  filenameMap.set(file, encodeFilename(file))
      let fileSizeInBytes = stats.size;
      var fileModifiedTime = new Date(stats.mtime).getTime();
      // console.log(file)
      // console.log(file)
      let realname = isBase64(file) ? decodeURIComponent(escape(atob(file))) : file;

      obj['fileName'] = file;
      obj['fileSize'] = fileSizeInBytes;
      obj['fileModifiedTime'] = fileModifiedTime;
      obj['realname'] = realname

      resObjArr.push(obj);
    });

    res.send(JSON.stringify(resObjArr))
  });

  // log
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress
  ip = ip.replace(/::ffff:/, '');

  getFileLog(ip)
}

module.exports = GetFiles