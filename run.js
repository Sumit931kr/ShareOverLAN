// To Run the Exe file 
const { exec } = require('child_process');
const path = require("path");
const os = require('os');
const dotenv = require('dotenv');
const qr = require('qrcode');


dotenv.config();

// const scriptPath = 'F:/Projects/Sync-share-frontEnd/server/index.js';
const scriptPath = path.join(__dirname, '/index.js')
// console.log(scriptPath);

// Run the script using the 'node' command

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

const PORT = process.env.PORT || 6969

const localIpAddress = getLocalIpAddress();



console.log("Server is Listening at ");
console.log(`http://${localIpAddress}:${PORT}`);
exec(`nodemon ${scriptPath}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing the script: ${error}`);
    setTimeout(() => {
        
    }, 20000); 
    return;
  }


  console.log(`Script output: ${stdout}`);
  console.error(`Script errors: ${stderr}`);
});


let data =  `http://${localIpAddress}:${PORT}`;

qr.toString(data, {type:'terminal'},(err, code)=>{
  if(err) return console.log(err)
  console.log(code)
})

