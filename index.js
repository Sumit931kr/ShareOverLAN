const express = require('express')
const cors = require('cors'); 
const dotenv = require('dotenv');

dotenv.config();
const os = require('os');

const PORT =  process.env.PORT
const path = require("path");
const fs = require("fs");
const app = express();


app.use('/download', express.static('./tmp/resource'))
app.use(cors());
app.use(express.static(path.join(__dirname, 'client')));

const multer = require("multer");


function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  let ipAddress;

  for (const key in interfaces) {
    for (const iface of interfaces[key]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddress = iface.address;
        break;
      }
    }
    if (ipAddress) break;
  }

  return ipAddress || 'Unable to retrieve local IP address';
}

const localIpAddress = getLocalIpAddress();

app.get('/', (req, res) => {
  // console.log(req)
  // var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
  // res.sendFile(path.join(__dirname, 'public', 'index.html'));
  res.sendFile(path.join(__dirname, 'client', 'index.html'))
  // res.sendFile(path.join(__dirname, 'client', 'index.js'))
  // res.sendFile(path.join(__dirname, 'client', 'style.css'))

})


app.get('/getfiles', (req, res) => {

  let resObj = [];

  let filesArr = fs.readdir('./tmp/resource', (err, files) => {
    // console.log(typeof (files[2]))

    // return files
    files.forEach(file => {
      let obj ={}
      let stats = fs.statSync("./tmp/resource/"+ file)
      let fileSizeInBytes = stats.size;
      obj['file'] = file;
      obj['size'] = fileSizeInBytes;
      
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

const upload = multer({
  dest: "/tmp/resource"
  // you might also want to set some limits: https://github.com/expressjs/multer#limits
});


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

app.get('/filedownload', (req, res) => {
  console.log("sumti is shere")

  const { name } = req.query;
  console.log("name " + name)
  const targetPath = path.join(__dirname, `./tmp/resource/${name}`);

  console.log(targetPath)
  try {
    res.download(targetPath)
  } catch (error) {
    console.log("error " + error)
    res.send('Something Went wrong')
  }
  // res.send('us')

})

// async function getIpAddress() {
  // const pc = new RTCPeerConnection();
  // pc.createDataChannel('');

  // pc.createOffer()
  //     .then(offer => pc.setLocalDescription(offer))
  //     .catch(error => console.error('Error creating offer:', error));

  // pc.onicecandidate = event => {
  //     if (event.candidate) {
  //       console.log(event)
  //         const ipRegex = /\d+\.\d+\.\d+\.\d+/;
  //         const ipAddress = ipRegex.exec(event.candidate.candidate);
  //         // document.getElementById('ip').innerText = ipAddress;
  //         console.log("ip "+ ipAddress)
         
  //         return ipAddress;
  //     }
  // };
//  await fetch('https://api.ipify.org?format=json')
//         .then(response => response.json())
//         .then(data => {
//             // Logging IP address to console
//             console.log('Your IP address is ' + data.ip);
//         })
// }

// console.log(getIpAddress());

// console.log('Local IP Address:', localIpAddress);


app.listen(PORT, () => {
  console.log("Server is Listening at ");
  console.log(`http://${localIpAddress}:${PORT}`);
})

