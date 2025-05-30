const path = require('path')
const fs = require('fs');

const ViewFile = (req,res) =>{
  let { name } = req.query;

  if(req.originalUrl.includes('&')){
    // console.log("true")
    let arr = req.originalUrl.split('=')
    arr.shift()
    name = decodeURIComponent(arr.join(''))
  }

  const targetPath = process.pkg ? path.resolve(process.execPath, '..', 'tmp', 'resource', name) : path.join(__dirname, `../tmp/resource/` + name);

  try {

    // console.log(targetPath)
    const videoPath = targetPath; // Update with the path to your video file
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    // console.log(range)

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

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.log("error " + error)
    res.send('Something Went wrong')
  }
}

module.exports = ViewFile