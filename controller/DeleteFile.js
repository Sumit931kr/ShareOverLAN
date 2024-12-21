const path = require("path");
const fs = require("fs");
const { deleteFileLog } = require("../extra/Logging");


function isBase64(str) {
    try {
      // Attempt to decode and encode to validate the string
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

const DeleteFile = (req, res) => {

    let { name } = req.query;

    const targetPath = process.pkg ? path.resolve(process.execPath, '..', 'tmp', 'resource', name) : path.join(__dirname, `../tmp/resource/` + name);;
   

    if (!fs.existsSync(targetPath)) {
        return res.status(404).send('File not found');
    }

    try {
        fs.unlink(process.pkg ? path.resolve(process.execPath, '..', 'tmp', 'resource', name) : path.join(__dirname, `../tmp/resource/` + name), (err) => {
            if (err) {
                console.log("some Error occured")
                res.status(400).send("Error Occured")
            }

      
            // log
            var ip = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress
            ip = ip.replace(/::ffff:/, '');
            let realname = isBase64(name) ? atob(decodeURIComponent(name)) : name;
            deleteFileLog(ip, realname)

            res.status(200).send("File deleted successfully");
        })

    } catch (error) {
        console.log("error " + error)
        res.send('Something Went wrong')
    }

}

module.exports = DeleteFile




