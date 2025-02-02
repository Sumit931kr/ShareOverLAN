const archiver = require('archiver');
const fs = require("fs");
const path = require('path')
const { ZipDownloadLog } = require('../extra/Logging')

// zip file name function 
const zipName = () => new Date(Date.now() + 19800000).toISOString().slice(0, -5) + ".zip"


function isBase64(str) {
  try {
    // Attempt to decode and encode to validate the string
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

const ZipDownload = async (req, res) => {
  try {
    let { names } = req.query;
    if(req.originalUrl.includes('&')){
      let arr = req.originalUrl.split('=')
      arr.shift()
      names = decodeURIComponent(arr.join(''))
    }

    let arr = names
    let zipFileName = zipName();
    // console.log(zipFileName)

    if (!arr || typeof (arr) == Object) return
    let files = JSON.parse(arr);
    // console.log(files)

    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level
    });

    archive.on('error', (err) => {
      console.error(err);
      res.status(500).send({ error: 'Error creating the zip file' });
    });

    for (let i = 0; i < files.length; i++) {

      const targetPath = process.pkg ? path.resolve(process.execPath, '..', 'tmp', 'resource', files[i]) : path.join(__dirname, `../tmp/resource/` , files[i]);
      // const targetPath =  path.join(__dirname, `../tmp/resource/`, files[i]);
      if (fs.existsSync(targetPath)) {
        let realname = isBase64(files[i]) ? decodeURIComponent(atob(files[i])) : files[i];
        // console.log("realname "+ realname)
        archive.file(targetPath, { name: realname }); // Add each file to the archive
      }
    }
    archive.pipe(res);
    archive.finalize();

    // log
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress
    ip = ip.replace(/::ffff:/, '');

    const filesName = files.map((file) => {
      const targetPath = path.join(__dirname, `../tmp/resource/`, file);
      if (fs.existsSync(targetPath)) {
        let realname = !file.includes(".") ? decodeURIComponent(atob(file)) : file;
        return realname
      }
    })

    ZipDownloadLog(ip,filesName)

  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: 'Internal server error' });
  }
}

module.exports = ZipDownload