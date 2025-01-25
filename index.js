const express = require('express')
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const qrcode = require('qrcode');
const path = require("path");
const fs = require("fs");



// extra
const getLocalIpAddress = require('./extra/GetLocalIpAdress')
const getLocalTime = require('./extra/GetLocalTime')
const fileRoutes = require('./routes/fileRoutes');
const { startingServerLog } = require('./extra/Logging');
const { openBrowserBasedOnOS } = require('./extra/openBrowserBasedOnOS');
const {convertAllFilesToReadableFile} = require('./extra/ChangeFileName')

dotenv.config();
convertAllFilesToReadableFile();

const args = process.argv.slice(2); // Remove the first two default elements
let port;
let devMode = false // Default is false;
args.forEach((arg, index) => {
    if (arg.toLowerCase() === '--port' || arg.toLowerCase() === '-p') {
        port = args[index + 1];
    }
    if (arg.toLowerCase() === '--dev') {
        devMode = true;
    }
});



const localIpAddress = getLocalIpAddress();
const PORT = port || process.env.PORT || 6969
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());
app.use('/download', express.static('./tmp/resource'))
app.use(express.static(path.join(__dirname, 'client')));
// Path to the folder you want to make public
const publicFolder = path.join(__dirname, 'tmp/resource');

// Serve the folder publicly
app.use('/public', express.static(publicFolder));

var dir = './tmp/resource';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}


// Sending the index.html file 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'))
})

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'chat.html'))
})


app.use('/api/v1/', fileRoutes)

const io = require("socket.io")(app.listen(PORT, () => {
  console.log("Server started at " + getLocalTime())
  console.log('Socket Server Started && ');
  console.log("Server is Listening at ");

  console.log(`--> Local:   http://localhost:${PORT}`);
  localIpAddress.map((el) => {
    console.log(`--> Network: http://${el}:${PORT}`);
    if(!devMode){
      qrcode.toString(`http://${el}:${PORT}`,{type:'terminal'}, function (err, url) {
        console.log(url)
      })
    }
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


let messages = [];

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

// chat releated routes
app.get('/getoldmessages', (req, res) => {
  let data = {
    messages: messages,
    users: users
  }
  res.send(JSON.stringify(data));
})

// convert all the files into readbale file 

