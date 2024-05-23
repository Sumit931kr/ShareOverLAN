const path = require("path");
const fs = require("fs");



const handleError = (err, res) => {
    res
      .status(500)
      .contentType("text/plain")
      .end("Oops! Something went wrong!");
  };

const UploadHandle = (req,res) =>{

    const tempPath = req.file.path;

    let fakename = btoa(encodeURIComponent(req.file.originalname));
    const targetPath = path.join(__dirname, `../tmp/resource/${fakename}`);

    if (true) {
      fs.rename(tempPath, targetPath, err => {
        if (err) return handleError(err, res);

        res
          .status(200)
          .contentType("text/plain")
          .json("File uploaded!");
      });
    } else {
      fs.unlink(tempPath, err => {
        if (err) return handleError(err, res);

        res
          .status(403)
          .contentType("text/plain")
          .end("Only .png files are allowed!");
      });
    }
}

module.exports = UploadHandle