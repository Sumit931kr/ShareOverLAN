let downloadContainer = document.querySelector('.downloadContainer');
const downlaodSection = document.querySelector('.download_section');


const downloadAll = document.querySelector('.pch-downloadAll');

const uploadSection = document.querySelector('.upload_section');
// var output = document.getElementById('output');
// var outputText =  document.querySelector('.output-txt');
let nearbyPeopleContainer = document.getElementById('nearby_people')
const outPutContainer = document.getElementById('output-container');
let downlaodSectionButton = document.getElementById('downlaod_section_button')

const streamAbleExtenstion = [
  "mp4",  // MPEG-4 Video
  "webm", // WebM Video
  "mkv",  // Matroska Video
  "mov",  // QuickTime Movie
  "avi",  // Audio Video Interleave
  "flv",  // Flash Video
  "wmv",  // Windows Media Video
  "m4v",  // MPEG-4 Video
  "3gp",   // 3GPP Video
  "mp3",  // MPEG Audio Layer III
  "wav",  // Waveform Audio File
  "aac",  // Advanced Audio Codec
  "ogg",  // Ogg Vorbis
  "flac", // Free Lossless Audio Codec
  "m4a",  // MPEG-4 Audio
  "wma"   // Windows Media Audio
];


const axiosInstance = axios.create({
  responseType: 'blob',
  // httpsAgent: agent,
  // Other common configuration options can be set here
});

const socket = io('/');

var shouldContinue = true;

var sizeCounter = 0;
let sizeMeter = {
  0: 'KB',
  1: 'MB',
  2: 'GB',
  3: 'TB'
}


// format the second
function formatSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "";
  }

  const days = Math.floor(seconds / (3600 * 24));
  seconds %= 3600 * 24;

  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  let result = '';

  if (days > 0) {
    result += days + ' day ';
  }

  if (hours > 0) {
    result += hours + ' hour ';
  }

  if (minutes > 0) {
    result += minutes + ' min ';
  }

  if (remainingSeconds > 0) {
    result += Math.floor(remainingSeconds) + ' sec';
  }

  return result.trim();
}

// format the byte
const manageByte = (num) => {
  if (!num) return 0
  let res = num / 1024;
  if (res > 1000) {
    sizeCounter++;
    return manageByte(res)
  }
  else {
    let value = sizeCounter;
    sizeCounter = 0;
    return res.toFixed(2) + sizeMeter[value]
  }
}

const timeFormat = (time) => {
  if (!time) return "Invalid Date";

  else {
    return new Date(time).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + " " +
      new Date(time).toLocaleTimeString({
        hour: "2-digit",
        minute: "2-digit",
      })

  }
}

// check if th file able to stream or not 

const isAbleToStream = (filename) => {
  let extension = filename.split('.')[filename.split('.').length - 1]
  return streamAbleExtenstion.includes(extension)
}

var DownloadableFileData = [];

// get downlaod Files
const getDownloadFiles = async () => {
  const response = await axios.get('/api/v1/getFiles');
  let data = response.data;
  DownloadableFileData = [];
  DownloadableFileData = [...data]

  if (data.length > 0) {
    let mappedData = data.sort((b, a) => { return a?.fileModifiedTime - b?.fileModifiedTime }).map((el, index) => {
      // console.log(el.fileName)
      let streamBtn = isAbleToStream(el.fileName) ? `
        <a class="view_file" href="/api/v1/viewfile?name=${el.fileName}" target="_blank">
        <img src="../assets/share-icon.webp" />
        </a>`
        : "";
 
      return `
      <div class='item' key="${index}"> 
        <div class="inputcheckboxdiv"> <input type="checkbox" class="inputcheckbox" value="${el.fileName}"/> </div>
        <div class="file_name">${el.realname} 
           ${streamBtn}
        </div>
        <div class="file_size">${manageByte(el.fileSize)}</div>
        <div class="file_modified_date">${timeFormat(el.fileModifiedTime)}</div>
        <div class="file_delete"><img src="../assets/delete.png" data-filename="${el.fileName}" onclick="deleteFile(event)" /></div>
       <a class="file_download" href="/api/v1/filedownload?name=${el.fileName}" downlaod >Downlaod</a>
      </div>
        <hr/>
      `
    }).join("")
    downlaodSection.innerHTML = mappedData

    // console.log(mappedData)
  }
  else if (data.length == 0) {
    downlaodSection.innerHTML = ""
  }

  downlaodSectionButton.classList.remove('red-dot')
  //  downloadButton();
}

const checkAccessToken = async (token) => {
  if (!token) return false
  try {
    const response = await axiosInstance.get('/api/v1/access?accessToken=' + token);
    if (response.status == 200) {
      sessionStorage.setItem('accessToken', token)
      return true
    }
    else return false
  } catch (error) {
    console.log("some Error Occured")
    console.log(error)
    sessionStorage.removeItem('accessToken')
    return false
  }
}

// view file 

const viewFile = async (e) => {
  let filename = e.target.getAttribute('data-filename');
  if (!filename) {
    console.log("couldn't fetch name from data attributes")
    return
  }

  console.log(filename)

  const response = await axiosInstance.delete('/api/v1/deletefile?name=' + filename);
  // console.log(response)
  if (response.status = 200) {
    // console.log("file Deleted")
    getDownloadFiles()
  }

}

// delete file function 
const deleteFile = async (e) => {

  let accessToken = sessionStorage.getItem('accessToken');
  if (!accessToken) {
    let token = prompt("Enter the pass Code");
    if (!token) return
    let isAccess = await checkAccessToken(token);
    // console.log(isAccess)
    if (!isAccess) {
      alert("Wrong token")
    } else {
      alert("verified ,try again")
    }
  }
  else {

    let filename = e.target.getAttribute('data-filename');
    if (!filename) {
      console.log("couldn't fetch name from data attributes")
      return
    }
    // console.log(filename)

    const response = await axiosInstance.delete('/api/v1/deletefile?name=' + filename);
    // console.log(response)
    if (response.status = 200) {
      // console.log("file Deleted")
      getDownloadFiles()
    }

    socket.emit('fileschanged', "send")
  }

}



var downloadArr = [];

// zip file name function 
const zipName = () => new Date(Date.now() + 19800000).toISOString().slice(0, -5) + ".zip"

const getZipDownload = async () => {
  let checkArr = document.querySelectorAll('.inputcheckboxdiv>input[type=checkbox]:checked');
  let downloadAbleFile = [];

  checkArr.forEach(el => {
    downloadAbleFile.push(el.value);
  });

  // console.log(downloadAbleFile);
  let body = { arr: JSON.stringify(downloadAbleFile) }
  // console.log(body)
  // axios.post('/api/v1/zipdownload', body,{ responseType: 'blob' })
  // axios.get('/api/v1/zipdownload?names' + JSON.stringify(downloadAbleFile));

  const link = document.createElement('a');
  link.href = `/api/v1/zipdownload?names=${JSON.stringify(downloadAbleFile)}`
  link.setAttribute('download', zipName());

  // Simulate clicking the link to trigger the download
  link.click();

  // Clean up: remove the link after the download starts
  link.remove();

  clearAllcheckbox();
  buttonDisabledFalse();

  downloadAll.style.display = "none";

}

const clearAllcheckbox = () => {
  let checkArr = document.querySelectorAll('.inputcheckboxdiv>input[type=checkbox]');
  checkArr.forEach((el) => {
    el.checked = false;
  })


}

const buttonDisabledTrue = () => {
  let buttons = document.querySelectorAll('.file_download')

  if (buttons?.length > 0) {
    buttons.forEach((el) => {
      el.disabled = true;
      el.style.opacity = "0.4";
      el.style.cursor = "no-drop";
      el.style.pointerEvents = "none";
    })
  }

  let fileDeleteBtn = document.querySelectorAll('.file_delete')
  if (fileDeleteBtn?.length > 0) {
    fileDeleteBtn.forEach((el) => {
      el.disabled = true;
      el.style.opacity = "0.4";
      el.style.cursor = "no-drop";
      el.style.pointerEvents = "none";
    })
  }
}

const buttonDisabledFalse = () => {
  let buttons = document.querySelectorAll('.file_download')
  buttons.forEach((el) => {
    el.disabled = false;
    el.style.opacity = "1";
    el.style.cursor = "pointer";
    el.style.pointerEvents = "auto";
  })

  let fileDeleteBtn = document.querySelectorAll('.file_delete')
  if (fileDeleteBtn?.length > 0) {
    fileDeleteBtn.forEach((el) => {
      el.disabled = false;
      el.style.opacity = "1";
      el.style.cursor = "pointer";
      el.style.pointerEvents = "auto";
    })
  }

}

const downloadFile = async (str) => {
  // console.log(str)
  downloadArr.push(str);

  let dcount = downloadArr.indexOf(str);

  let div = document.createElement('div');
  let innerHTML = `<div class="doutput-txt-${dcount}">${str}</div>
                   <div class="doutput-${dcount} output-progess"></div>`

  div.innerHTML = innerHTML;
  downloadContainer.append(div)

  const options = {
    responseType: 'blob',

    onDownloadProgress: function (progressEvent) {
      var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      // console.log(progressEvent)
      var doutput = document.querySelector('.doutput-' + dcount);
      // console.log(dcount)
      doutput.style.width = `${percentCompleted}%`
      doutput.innerHTML = percentCompleted + "%"
      if (percentCompleted == 100) {
        doutput.innerHTML = "File downloaded Successfully"
      }
    },
  };

  try {
    // const response = await axios.get('/api/v1/filedownload?name=' + str, options);
    const response = await axiosInstance.get('/api/v1/filedownload?name=' + str, options);

    // console.log(response.data)
    // Create a blob from the response data
    const blob = new Blob([response.data], { type: response.headers['content-type'] });

    // console.log(blob)
    // Create a link element
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);

    // Specify the desired file name and extension
    link.download = str;

    // Append the link to the document
    document.body.appendChild(link);

    // Trigger a click on the link to initiate the download
    link.click();

    // Remove the link from the document
    document.body.removeChild(link);

    // console.log('File download initiated successfully!');
  } catch (error) {
    console.error('Error downloading file:', error.message);
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.message);
      // Handle Axios-specific errors (e.g., network errors)
    } else {
      console.error('General Error:', error.message);
      // Handle other types of errors
    }
  }

  let index = downloadArr.indexOf(str);
  downloadArr[index] = downloadArr[index] + Math.random(1);

};

var uploadArr = [];

// file upload code 
const fileUploadCode = async ({ file, i }) => {

  uploadArr.push(file?.name);
  // let count = uploadArr.indexOf(file?.name);
  let count = i;

  shouldContinue = false;
  let pDiv = document.createElement('div');
  pDiv.classList.add('uploadFileGap')
  let innerhtml = `<div class="output-txt-${count}" style="display:flex; line-break:anywhere; width:90%">${file?.name}</div>               
                   <div class="outputByte-${count}"></div>
                   <div class="output-${count} output-progess"></div>`

  pDiv.innerHTML = innerhtml;
  outPutContainer.appendChild(pDiv);


  var config = {
    onUploadProgress: function (progressEvent) {
      // let speed = ( progressEvent.total - progressEvent.loaded )/ progressEvent.rate
      // console.log(speed);
      // console.log(formatSeconds(speed))
      // console.log(progressEvent)
      // console.log(manageByte(progressEvent.loaded))
      var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      // console.log(manageByte(progressEvent.rate) +"/s")
      var output = document.querySelector('.output-' + count);
      let outputByte = document.querySelector('.outputByte-' + count);
      outputByte.innerHTML = `(${manageByte(progressEvent.loaded)}/${manageByte(progressEvent.total)}) ${manageByte(progressEvent.rate)}/s </br> Estimate time : ${formatSeconds(progressEvent.estimated)}`
      // console.log()
      output.style.width = `${percentCompleted}%`
      output.innerHTML = percentCompleted + "%";
      if (percentCompleted == 100) {
        outputByte.innerHTML = `size : ${manageByte(progressEvent.total)}`
        output.innerHTML = "File Uploaded Successfully"
        output.parentElement.innerHTML = `<div class="cancelme" onclick="this.parentElement.style.display = 'none';" >X</div>
        ${output.parentElement.innerHTML}`
      }
    }
  };

  var formdata = new FormData();
  formdata.append('file', file)
  await axios.post('/api/v1/upload', formdata, config)
    .then(function (res) {
      count++;
      myNum++;
      fileArrForCall(curFiles);
    })
    .catch(function (err) {
      console.log('err ' + err)
    });

  socket.emit('fileschanged', "send")


}

const dropHandler = (ev) => {
  overlayHidden();
  // console.log("File(s) dropped");
  uploadButton();
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    let fileArr = [];
    // fileArrForCall(curFiles);
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === "file") {
        // console.log("num")
        const file = item.getAsFile();
        fileArr.push(file);
        // console.log(file)
      }

    });
    curFiles = fileArr;
    fileArrForCall(curFiles);
  } else {
    // Use DataTransfer interface to access the file(s)
    [...ev.dataTransfer.files].forEach((file, i) => {
      console.log(`… file[${i}].name = ${file.name}`);
    });
  }
}

const dragOverHandler = (ev) => {
  // console.log("File(s) in drop zone");
  overlayShow();
  // document.getElementById('drop_zone').style.scale = '1.1'

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

const dragOverleave = () => {
  // console.log("leave")
  overlayHidden();
}

// Show download page
const downloadButton = async () => {
  uploadSection.style.display = 'none';
  downlaodSection.style.display = 'flex';
  getDownloadFiles();
  callme();
}

// show upload page 
const uploadButton = async () => {
  downlaodSection.style.display = 'none';
  uploadSection.style.display = 'flex';


  buttonDisabledFalse();
  downloadAll.style.display = "none";

}

var myNum = 0;
var curFiles

// upload by clicking the input
const submitValue = (ev) => {
  const inputFile = document.getElementById('forFile');
  curFiles = inputFile.files;
  fileArrForCall(curFiles);
}

const fileArrForCall = (files) => {
  if (files[myNum]) {
    fileUploadCode({ file: files[myNum], i: uploadArr.length })
  }
  else {
    myNum = 0;
    // document.getElementById('drop_zone').style.pointerEvents = "visible";
  }
}

const callme = () => {

  setTimeout(() => {
    const inputcheckboxArr = document.querySelectorAll('.inputcheckbox');

    const downloadAll = document.querySelector('.pch-downloadAll');
    // console.log(inputcheckboxArr)
    inputcheckboxArr.forEach((input) => {
      input.addEventListener('click', (el) => {
        // console.log(el)
        const inputchecked = document.querySelectorAll('.inputcheckboxdiv>input[type="checkbox"]:checked');
        // console.log(inputchecked.length)
        if (inputchecked.length > 0) {
          buttonDisabledTrue();
          downloadAll.style.display = "block"
        }
        else {
          buttonDisabledFalse();
          downloadAll.style.display = "none";
        }

      })
    })
  }, 500);
}
callme();


// show mainconatiner as overlay screen
let overlayText = document.querySelector('.overlay-text');
let mainContainer = document.querySelector('.main-container')

const overlayShow = () => {
  mainContainer.style.display = 'none';
  overlayText.style.display = 'flex';

  // mainContainer.classList.add('overlayShow')
  // mainContainer.classList.remove('overlayHidden')
  // mainContainer.classList.add('overlaytext')
}

const overlayHidden = () => {
  mainContainer.style.display = 'inline';
  overlayText.style.display = 'none';

  // overlayText.style.display = "none";
  // mainContainer.classList.add('overlayHidden')
  // mainContainer.classList.remove('overlayShow')
  // mainContainer.classList.remove('overlaytext')
}

document.querySelector('.main-container').addEventListener('paste', (e) => {
  // console.log("op")
  let files = e.clipboardData.files;
  console.log(files)

  if (!files[0]) return;
  if (files[0].name == "image.png") {

    uploadButton();

    let nameArr = files[0].name.split('.');
    let newName = nameArr[0] + Date.now() + "." + nameArr[1];
    let newFile = { 0: new File([files[0]], newName, { type: files[0].type }) }
    console.log(newFile)
    // fileUploadCode({ file: newFile, i: uploadArr.length });

    curFiles = newFile;
    fileArrForCall(curFiles);

  }
})


// socket functions

socket.on('fileschanged', message => {
  console.log(message);
  downlaodSectionButton.classList.add('red-dot')


})