const path = require("path");
const fs = require("fs");
const { downloadFileLog } = require('../extra/Logging')

const FileDownload = (req, res) => {

  let { name } = req.query;

  const targetPath = process.pkg ? path.resolve(process.execPath, '..', 'tmp', 'resource', name) : path.join(__dirname, `../tmp/resource/` + name);
  // console.log(targetPath)

  if (!fs.existsSync(targetPath)) {
    return res.status(404).send('File not found');
  }

  try {
    // const stream = fs.createReadStream(targetPath);
    const stats = fs.statSync(targetPath);
    const fileSize = stats.size;

    let realname = !name.includes(".") ? atob(decodeURIComponent(name)) : name;

    res.setHeader('Content-Disposition', `attachment; filename="${realname}"`);
    res.setHeader('Content-Length', fileSize);

    const fileStream = fs.createReadStream(targetPath);

    // Pipe the file stream to the response object
    fileStream.pipe(res);

    // Optional: Handle errors
    fileStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).send('Internal Server Error');
    });

    res.status(200)

    // log
    var ip = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress
    ip = ip.replace(/::ffff:/, '');

    downloadFileLog(ip,realname)

  } catch (error) {
    console.log("error " + error)
    res.send('Something Went wrong')
  }
}

module.exports = FileDownload