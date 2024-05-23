const fs = require("fs");

const GetFiles = (req,res) =>{
    let resObjArr = [];

    fs.readdir('./tmp/resource', (err, files) => {
  
      files.forEach(file => {
        let obj = {}
        let stats = fs.statSync("./tmp/resource/" + file)
        //  filenameMap.set(file, encodeFilename(file))
        let fileSizeInBytes = stats.size;
        var fileModifiedTime = new Date(stats.mtime).getTime();
        // console.log(file)
  
        let realname = !file.includes(".") ? decodeURIComponent(atob(file)) : file
  
        obj['fileName'] = file;
        obj['fileSize'] = fileSizeInBytes;
        obj['fileModifiedTime'] = fileModifiedTime;
        obj['realname'] = realname
  
        resObjArr.push(obj);
      });
  
      res.send(JSON.stringify(resObjArr))
    });
}

module.exports = GetFiles