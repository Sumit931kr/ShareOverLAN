const downlaodSection = document.querySelector('.download_section');

// var count = 0;
const uploadSection = document.querySelector('.upload_section');
// var output = document.getElementById('output');
// var outputText =  document.querySelector('.output-txt');
let nearbyPeopleContainer = document.getElementById('nearby_people')
const outPutContainer = document.getElementById('output-container');

// const https = require('https');
// const agent = new https.Agent({  
// rejectUnauthorized: false
// });
const axiosInstance = axios.create({
  responseType: 'blob',
  // httpsAgent: agent,
  // Other common configuration options can be set here
});

var shouldContinue = true;

var sizeCounter = 0;
let sizeMeter = {
  0: 'KB',
  1: 'MB',
  2: 'GB',
  3: 'TB'
}

const manageByte = (num) => {
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

const getDownloadFiles = async () => {
  const response = await axios.get('/getFiles');
  let data = response.data;

  if (data.length > 0) {
    let mappedData = data.sort((b, a) => { return a?.fileModifiedTime - b?.fileModifiedTime }).map((el, index) => {
      // <div class="file_view">
      // <a href="/viewfile?name=${el.file}" target="_blank"> View </a>
      //  </div>
      return `<div key="${index}"> 
      <div class="file_name">${el.fileName}</div>
      <div class="file_size">${manageByte(el.fileSize)}</div>
      <button class="file_download" onclick="downloadFile('${el.fileName}')"> Download
      </button>
      </div>
      <hr/>
      <br>
      `
    }).join("")
    downlaodSection.innerHTML = mappedData

    // console.log(mappedData)
  }
  //  downloadButton();
}

var downloadArr = [];

const downloadFile = async (str) => {
  downloadArr.push(str);

let dcount = downloadArr.indexOf(str);

  let downloadContainer = document.querySelector('.downloadContainer');
  let div = document.createElement('div');
  let innerHTML = `<div class="doutput-txt-${dcount}">${str}</div>
  <div class="doutput-${dcount} output-progess"></div>`

  div.innerHTML = innerHTML;
  downloadContainer.append(div)

  // console.log(str);


  const options = {
    responseType: 'blob',

    onDownloadProgress: function (progressEvent) {
      var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      // console.log(progressEvent)
      var doutput = document.querySelector('.doutput-' + dcount);
      console.log(dcount)
      doutput.style.width = `${percentCompleted}%`
      doutput.innerHTML = percentCompleted + "%"
      if (percentCompleted == 100) {
        doutput.innerHTML = "File downloaded Successfully"
      }
    },
  };



  try {
    // const response = await axios.get('/filedownload?name=' + str, options);
    const response = await axiosInstance.get('/filedownload?name=' + str, options);

    // Create a blob from the response data
    const blob = new Blob([response.data], { type: response.headers['content-type'] });

    console.log(blob)
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

    console.log('File download initiated successfully!');
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
};

// Example usage
// downloadFile('exampleFileName');


// const downloadFile = async(str) =>{
//   console.log(str);
//   const options = {
//     // Defines options for request

//       responseType: 'blob',
//       // For a file (e.g. image, audio), response should be read to Blob (default to JS object from JSON)

//       onDownloadProgress: function(progressEvent) {
//       // Function fires when there is download progress
//       var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);   
//       console.log(percentCompleted)
//           // console.log(Math.floor(progressEvent.loaded / progressEvent.total *100));
//           // Logs percentage complete to the console

//       }

//     }

//     axios.get('/filedownload?name='+str, options)
//     // Request with options as second parameter
//       .then(res => console.log(res.save()))
//       .catch(err => console.log(err))



// }


const searchNearbyPeople = async () => {
  console.log("just clicked");

  for (let i = 0; i < nearbyPeople.length; i++) {
    let str = `<h2> ${nearbyPeople[i].ip} </h2>`
    nearbyPeopleContainer.innerHTML += str;
  }
}




var uploadArr = [];

const fileUploadCode = async (file) => {

uploadArr.push(file?.name);
let count =  uploadArr.indexOf(file?.name);

  shouldContinue = false;
  let pDiv = document.createElement('div');
  let innerhtml = `<div class="output-txt-${count}">${file?.name}</div>
                   <div class="output-${count} output-progess"></div>`

  pDiv.innerHTML = innerhtml;
  outPutContainer.appendChild(pDiv);


  var config = {
    onUploadProgress: function (progressEvent) {
      var percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      // console.log(progressEvent)
      var output = document.querySelector('.output-' + count);
      // console.log()
      output.style.width = `${percentCompleted}%`
      output.innerHTML = percentCompleted + "%"
      if (percentCompleted == 100) {
        output.innerHTML = "File Uploaded Successfully"
      }
    }
  };


  var formdata = new FormData();
  formdata.append('file', file)
  await axios.post('/upload', formdata, config)
  .then(function (res) {
      count++;
      myNum++;
      fileArrForCall(curFiles);
    })
    .catch(function (err) {
      console.log('err ' + err)
    });

}

const dropHandler = (ev) => {
  console.log("File(s) dropped");
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
    let fileArr = [];
    // fileArrForCall(curFiles);
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === "file") {
        console.log("num")
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
  console.log("File(s) in drop zone");
  // document.getElementById('drop_zone').style.scale = '1.1'

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}

const downloadButton = async () => {
  uploadSection.style.display = 'none';
  downlaodSection.style.display = 'inline';
  getDownloadFiles();
}

const uploadButton = async () => {
  downlaodSection.style.display = 'none';
  uploadSection.style.display = 'inline';

}

var myNum = 0;
var curFiles

// upload by clicking the input
const submitValue = (ev) => {
  const inputFile = document.getElementById('forFile');
  curFiles = inputFile.files;

  fileArrForCall(curFiles);
  // document.getElementById('drop_zone').style.pointerEvents = "none";
  // for (const file of curFiles) {
  //   if (shouldContinue) {
  //     fileUploadCode(file)
  //   }
  // }
}

const fileArrForCall = (files) => {
  if (files[myNum]) {
    fileUploadCode(files[myNum])
  }
  else {
    myNum = 0;
    // document.getElementById('drop_zone').style.pointerEvents = "visible";
  }
}