const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const os = require('os');

const PORT = process.env.PORT
const path = require("path");
const fs = require("fs");
const app = express();


app.use('/download', express.static('./tmp/resource'))
app.use(cors());
app.use(express.static(path.join(__dirname, 'client')));

const multer = require("multer");

const upload = multer({
  dest: "/tmp/resource"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});



// Sending the index.html file 
app.get('/', (req, res) => {
  // console.log(req)
  // var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
  // res.sendFile(path.join(__dirname, 'public', 'index.html'));
  res.sendFile(path.join(__dirname, 'client', 'index.html'))
  // res.sendFile(path.join(__dirname, 'client', 'index.js'))
  // res.sendFile(path.join(__dirname, 'client', 'style.css'))

})

// Send Array of Downloadable file
app.get('/getfiles', (req, res) => {

  let resObj = [];

  let filesArr = fs.readdir('./tmp/resource', (err, files) => {
    // console.log(typeof (files[2]))

    // return files
    files.forEach(file => {
      let obj = {}
      let stats = fs.statSync("./tmp/resource/" + file)

      let fileSizeInBytes = stats.size;
      var fileModifiedTime = new Date(stats.mtime).getTime()
      obj['fileName'] = file;
      obj['fileSize'] = fileSizeInBytes;
      obj['fileModifiedTime'] = fileModifiedTime;

      resObj.push(obj);
    });

    res.send(JSON.stringify(resObj))
    // console.log(resObj)
  });
  // console.log(filesArr)
  // 
  // console.log(JSON.stringify(filesArr))
})

const handleError = (err, res) => {
  res
    .status(500)
    .contentType("text/plain")
    .end("Oops! Something went wrong!");
};

// Code for Uploading the File
app.post("/upload",
  upload.single("file" /* name attribute of <file> element in your form */),
  (req, res) => {
    console.log(req.file)
    const tempPath = req.file.path;
    // const targetPath = path.join(__dirname, "./uploads/image.png");
    const targetPath = path.join(__dirname, `./tmp/resource/${req.file.originalname}`);

    // if (path.extname(req.file.originalname).toLowerCase() === ".png") {
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
);

// Sending the file to download 
app.get('/filedownload', (req, res) => {
  const { name } = req.query;
  const targetPath = path.join(__dirname, `./tmp/resource/${name}`);

  try {
    const stream = fs.createReadStream(targetPath);
    const stats = fs.statSync(targetPath);
    const fileSize = stats.size;

    stream.on('open', () => {
      res.set('Content-Type', '*');
      res.setHeader('Content-disposition', `attachment; filename=${targetPath.split('\\').pop()}`);
      res.setHeader('Content-Length', fileSize);
      stream.pipe(res);
    })
  } catch (error) {
    console.log("error " + error)
    res.send('Something Went wrong')
  }
})

// View file 
app.get('/viewfile', (req, res) => {
  const { name } = req.query;
  const targetPath = path.join(__dirname, `./tmp/resource/${name}`);
  try {
    console.log(targetPath)
    res.sendFile(targetPath)
  } catch (error) {
    console.log("error " + error)
    res.send('Something Went wrong')
  }
})

const getLocalIpAddress = () => {
  const interfaces = os.networkInterfaces();
  let ipAddress;
  for (const key in interfaces) {
    for (const iface of interfaces[key]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddress = iface.address;
        break;
      }
    }
    // if (ipAddress) break;
  }
  // console.log(ipAddress)
  return ipAddress || 'Unable to retrieve local IP address';
}

const localIpAddress = getLocalIpAddress();

app.listen(PORT, () => {
  console.log("Server is Listening at ");
  console.log(`http://${localIpAddress}:${PORT}`);
})


