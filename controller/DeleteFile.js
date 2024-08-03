const path = require("path");
const fs = require("fs");
const { deleteFileLog } = require("../extra/Logging");


const DeleteFile = (req, res) => {

    let { name } = req.query;

    const targetPath = path.join(__dirname, `../tmp/resource/` + name);
   

    if (!fs.existsSync(targetPath)) {
        return res.status(404).send('File not found');
    }

    try {
        fs.unlink(path.join(__dirname, `../tmp/resource/` + name), (err) => {
            if (err) {
                console.log("some Error occured")
                res.status(400).send("Error Occured")
            }

      
            // log
            var ip = req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress
            ip = ip.replace(/::ffff:/, '');
            let realname = !name.includes(".") ? atob(decodeURIComponent(name)) : name;
            deleteFileLog(ip, realname)

            res.status(200).send("File deleted successfully");
        })

    } catch (error) {
        console.log("error " + error)
        res.send('Something Went wrong')
    }

}

module.exports = DeleteFile




