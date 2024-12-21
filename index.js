const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const multer = require("multer");
const qrcode = require('qrcode');

// Controllers
const GetFiles = require('./controller/GetFiles')
const FileDownload = require('./controller/FileDownload')
const ZipDownload = require('./controller/Zipdownload');
const UploadHandle = require('./controller/UploadHandle');
const ViewFile = require('./controller/ViewFile');
const DeleteFile = require('./controller/DeleteFile')

// extra
const getLocalIpAddress = require('./extra/GetLocalIpAdress')
const getLocalTime = require('./extra/GetLocalTime')

dotenv.config();

const PORT = process.env.PORT || 6969
const path = require("path");
const fs = require("fs");
const { startingServerLog } = require('./extra/Logging');
const Access = require('./controller/Access');
const app = express();

const { openBrowserBasedOnOS } = require('./extra/openBrowserBasedOnOS')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use('/download', express.static('./tmp/resource'))
app.use(express.static(path.join(__dirname, 'client')));


var dir = './tmp/resource';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const upload = multer({
  dest: "/tmp/resource"
});

// Sending the index.html file 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'))
})

app.get('/media', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'media.html'))
})

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'chat.html'))
})

// Send Array of Downloadable file
app.get('/getfiles', GetFiles)

// Code for Uploading the File
app.post("/upload", upload.single("file"), UploadHandle);

// Sending the file to download 
app.get('/filedownload', FileDownload)

// Sending the file to download 
app.get('/zipdownload', ZipDownload)

// Delete the file
app.delete('/deletefile', DeleteFile)

// View file 
app.get('/viewfile', ViewFile)

// Access the Admin
app.get('/access', Access)


const localIpAddress = getLocalIpAddress();






const io = require("socket.io")(app.listen(PORT, () => {
  console.log("Server started at " + getLocalTime())
  console.log('Socket Serer Started && ');
  console.log("Server is Listening at ");

  console.log(`--> Local:   http://localhost:${PORT}`);
  localIpAddress.map((el) => {
    console.log(`--> Network: http://${el}:${PORT}`);
    qrcode.toString(`http://${el}:${PORT}`,{type:'terminal'}, function (err, url) {
      console.log(url)
    })
  })
  // Use the function to open the URL
  // openBrowserBasedOnOS(`http://localhost:${PORT}`);

  const folderPath = './log';

  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
    // console.log('Folder created!');
  }

  const folderPath2 = './tmp/resource';

  if (!fs.existsSync(folderPath2)) {
    fs.mkdirSync(folderPath2);
    // console.log('Folder created!');
  }

  startingServerLog(PORT)
}), {
  cors: {
    origin: '*',
  },
});


;

let messages = [];
let actionsCount = 0;

const users = {};
io.on('connection', socket => {
  socket.on('new-user-joined', name => {
    // console.log("new user name is " + name);
    users[socket.id] = name;
    socket.broadcast.emit('user-joined', name);
    messages.push({ name: name, message: 'Joined the chat', position: 'center' });
  })

  socket.on('send', message => {
    socket.broadcast.emit('receive', { message: message, name: users[socket.id] })
    messages.push({ name: users[socket.id], message: message, position: 'left' });
  });

  socket.on('fileschanged', message => {
    // console.log("inside fileschanged")
    let actionsCount = message;

    socket.broadcast.emit('fileschanged', actionsCount++);

  })

  socket.on('disconnect', message => {
    socket.broadcast.emit('left', users[socket.id])
    messages.push({ name: users[socket.id], message: 'Left the Chat', position: 'center' });
    delete users[socket.id];
  });

})

app.get('/getoldmessages', (req, res) => {
  let data = {
    messages: messages,
    users: users
  }
  res.send(JSON.stringify(data));
})


// shell-access lib initialized
// const initialization = require('shell-access')

// initialization("sumit");

// const { createProxyMiddleware } = require('http-proxy-middleware');
// // Proxy for the other service
// app.use('/shell-access', createProxyMiddleware({
//   target: 'http://localhost:8765',
//   ws: true,
//   changeOrigin: true,
// }));





// convert all the files into readbale file 

