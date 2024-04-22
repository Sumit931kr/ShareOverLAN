const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv');

const mime = require('mime');

dotenv.config();
const os = require('os');

const PORT = process.env.PORT || 6969
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


var dir = './tmp/resource';

if (!fs.existsSync(dir)){
  console.log("made one")
    fs.mkdirSync(dir);
}


// // Function to encode the filename
// function encodeFilename(filename) {
//   return encodeURIComponent(filename).replace(/%20/g, '+');
// }

// // Function to decode the filename
// function decodeFilename(filename) {
//   return decodeURIComponent(filename.replace(/\+/g, ' '));
// }


// Map to store original filename to encoded filename mapping
// const filenameMap = new Map();

// Sending the index.html file 
app.get('/', (req, res) => {
  // console.log(req)
  // var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
  // res.sendFile(path.join(__dirname, 'public', 'index.html'));
  res.sendFile(path.join(__dirname, 'client', 'index.html'))
  // res.sendFile(path.join(__dirname, 'client', 'index.js'))
  // res.sendFile(path.join(__dirname, 'client', 'style.css'))

})

app.get('/media', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'media.html'))
})

// Send Array of Downloadable file
app.get('/getfiles', (req, res) => {

  let resObjArr = [];

 fs.readdir('./tmp/resource', (err, files) => {

    files.forEach(file => {
      let obj = {}
      let stats = fs.statSync("./tmp/resource/" + file)
      //  filenameMap.set(file, encodeFilename(file))
      let fileSizeInBytes = stats.size;
      var fileModifiedTime = new Date(stats.mtime).getTime();
      // console.log(file)
      
      let realname = !file.includes(".") ? decodeURIComponent(atob(file)):file

      obj['fileName'] = file;
      obj['fileSize'] = fileSizeInBytes;
      obj['fileModifiedTime'] = fileModifiedTime;
      obj['realname'] = realname

      resObjArr.push(obj);
    });

    res.send(JSON.stringify(resObjArr))
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
 
    const tempPath = req.file.path;

    let fakename = btoa(encodeURIComponent(req.file.originalname));
    const targetPath = path.join(__dirname, `./tmp/resource/${fakename}`);

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

  let { name } = req.query;
  const targetPath = path.join(__dirname, `./tmp/resource/` + name);

  if (!fs.existsSync(targetPath)) {
    return res.status(404).send('File not found');
  }

  try {
    // const stream = fs.createReadStream(targetPath);
    const stats = fs.statSync(targetPath);
    const fileSize = stats.size;

    // stream.on('open', () => {
    //   const mimeType = mime.getType(targetPath);
    //   res.set('Content-Type', mimeType || 'application/octet-stream');
    //   res.setHeader('Content-disposition', `attachment; filename=${targetPath.split('\\').pop()}`);
    //   res.setHeader('Content-Length', fileSize);
    //   stream.pipe(res);
    // })

    let realname = !name.includes(".") ? atob(decodeURIComponent(name)): name;

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
    const videoPath = targetPath; // Update with the path to your video file
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    console.log(range)

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
      }
      else {
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
        };
        console.log("done")
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }


    // const fileStream = fs.createReadStream(targetPath);

    // // Pipe the file stream to the response object
    // fileStream.pipe(res);

    // // Optional: Handle errors
    // fileStream.on('error', (err) => {
    //   console.error('Error streaming file:', err);
    //   res.status(500).send('Internal Server Error');
    // });

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
// const localIpAddress = "localhost";

app.listen(PORT, () => {
  console.log("Server is Listening at ");
  console.log(`http://${localIpAddress}:${PORT}`);
})


