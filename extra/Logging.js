const fs = require('fs');
const getLocalTime = require('./GetLocalTime');
const getLocalIpAddress = require('./GetLocalIpAdress')

// const name = require('../log')
const existCheck = fs.constants.F_OK;


const startingServerLog = (port) => {

    let logFileName = `${new Date(new Date().getTime()+19800000).toJSON().split('T')[0]}.txt`

    const localIpAddress = getLocalIpAddress();
    // console.log(localIpAddress)

    let startLog =
        `***************************************************************************
        \n
 Server started at ${getLocalTime()} \n
 Socket Server Started \n
 Server is Listening at \n
 --> Local:   http://localhost:${port}\n`
    let txt = localIpAddress.map((el) => {
        return (` --> Network: http://${el}:${port}\n`)
    }).join("")
    startLog += txt + '\n\n';

    fs.access(`./log/${logFileName}`, existCheck, (err) => {
        if (err) {
            fs.writeFile(`./log/${logFileName}`, startLog, err => {
                if (err) {
                    console.error(err);
                } else {
                    // file written successfully
                }
            })
        } else {
          
            fs.appendFile(`./log/${logFileName}`, startLog, err => {
                if (err) {
                    console.error(err);
                } else {
                    // file written successfully
                }
            })
        }
    });





}

const getFileLog = (ip) => {
    let logFileName = `${new Date(new Date().getTime()+19800000).toJSON().split('T')[0]}.txt`

    let FileLogString =
        `[${getLocalTime()}] [${ip}] Get All the Files\n`

    fs.appendFile(`./log/${logFileName}`, FileLogString, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    })
}

const downloadFileLog = (ip, fileName) => {
    let logFileName = `${new Date(new Date().getTime()+19800000).toJSON().split('T')[0]}.txt`

    let FileLogString =
        `[${getLocalTime()}] [${ip}] Download File [${fileName}]\n`

    fs.appendFile(`./log/${logFileName}`, FileLogString, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    })
}

const uploadFileLog = (ip, fileName) => {
    let logFileName = `${new Date(new Date().getTime()+19800000).toJSON().split('T')[0]}.txt`

    let FileLogString =
        `[${getLocalTime()}] [${ip}] Upload File [${fileName}]\n`

    fs.appendFile(`./log/${logFileName}`, FileLogString, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    })
}

const ZipDownloadLog = (ip, filesName) => {
    let logFileName = `${new Date(new Date().getTime()+19800000).toJSON().split('T')[0]}.txt`

    let FileLogString =
        `[${getLocalTime()}] [${ip}] Zip Download Files [${filesName}]\n`

    fs.appendFile(`./log/${logFileName}`, FileLogString, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    })
}

const deleteFileLog = (ip, fileName) => {
    let logFileName = `${new Date(new Date().getTime()+19800000).toJSON().split('T')[0]}.txt`

    let FileLogString =
        `[${getLocalTime()}] [${ip}] Delete File [${fileName}]\n`

    fs.appendFile(`./log/${logFileName}`, FileLogString, err => {
        if (err) {
            console.error(err);
        } else {
            // file written successfully
        }
    })
}

module.exports = {
    startingServerLog,
    getFileLog,
    downloadFileLog,
    uploadFileLog,
    ZipDownloadLog,
    deleteFileLog
}