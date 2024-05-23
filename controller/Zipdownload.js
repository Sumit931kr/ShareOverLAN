const archiver = require('archiver');
const fs = require("fs");
const path = require('path')

// zip file name function 
const zipName = () => new Date(Date.now() + 19800000).toISOString().slice(0, -5) + ".zip"


const ZipDownload = async (req,res) =>{
    try {
        let { names } = req.query;
        let arr = names
        let zipFileName = zipName();
        // console.log(zipFileName)
    
        if(!arr || typeof(arr) == Object) return
        let files = JSON.parse(arr);
        console.log(files)
    
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    
        const archive = archiver('zip', {
          zlib: { level: 9 } // Sets the compression level
        });
    
        archive.on('error', (err) => {
          console.error(err);
          res.status(500).send({ error: 'Error creating the zip file' });
        });
    
        for (let i = 0; i < files.length; i++) {
          const targetPath = path.join(__dirname, `../tmp/resource/`, files[i]);
          if (fs.existsSync(targetPath)) {
            let realname = !files[i].includes(".") ? decodeURIComponent(atob(files[i])) : files[i];
            // console.log("realname "+ realname)
            archive.file(targetPath, { name: realname }); // Add each file to the archive
          }
        }
        archive.pipe(res);
    
        archive.finalize();
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send({ error: 'Internal server error' });
      }
}

module.exports = ZipDownload