const fs = require("fs");

function isBase64(str) {
    try {
        // Attempt to decode and encode to validate the string
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
}

function convertAllFilesToReadableFile() {
    fs.readdir('./tmp/resource', (err, files) => {
        if (err) {
            console.error("Error reading directory:", err);
            return;
        }

        files.forEach(file => {
            try {
                if (isBase64(file)) {
                    // If the file name is in Base64, decode it
                    const decodedFileName = decodeURIComponent(escape(atob(file)));
                    console.log("Decoded File Name:", decodedFileName);

                    const oldPath = `./tmp/resource/${file}`;
                    const newPath = `./tmp/resource/${decodedFileName}`;

                    fs.rename(oldPath, newPath, (err) => {
                        if (err) {
                            console.error("Error renaming file:", err);
                            return;
                        }
                        console.log(`File renamed from '${oldPath}' to '${newPath}'`);
                    });

                } else {
                    // If not Base64, leave it as is
                    // console.log("Regular File Name:", file);
                }

                    //  const oldPath = `./tmp/resource/${file}`;
                    // const newPath = `./tmp/resource/${decodeURIComponent(file)}`;

                    // fs.rename(oldPath, newPath, (err) => {
                    //     if (err) {
                    //         console.error("Error renaming file:", err);
                    //         return;
                    //     }
                    //     console.log(`File renamed from '${oldPath}' to '${newPath}'`);
                    // });


            } catch (error) {
                console.error("Error processing file:", file, error.message);
            }
        });
    });
}

module.exports = {convertAllFilesToReadableFile}
