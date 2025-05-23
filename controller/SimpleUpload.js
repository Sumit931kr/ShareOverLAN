const path = require("path");
const fs = require("fs");
const { uploadFileLog } = require("../extra/Logging");
const multer = require("multer");

// Determine the appropriate directory for file uploads
const resourceDir = process.pkg
  ? path.resolve(process.execPath, "..", "tmp", "resource")
  : path.join(__dirname, "..", "tmp", "resource");

// Ensure the resource directory exists
if (!fs.existsSync(resourceDir)) {
  fs.mkdirSync(resourceDir, { recursive: true });
}

// Custom storage to preserve original filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resourceDir);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  }
});

const upload = multer({ storage });

// Middleware
const SingleUpload = upload.single("file");

// Route handler
const handleSingleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const originalname = req.file.originalname;
  let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  ip = ip.replace(/::ffff:/, "");

  uploadFileLog(ip, originalname);
  res.send(`File uploaded successfully: ${originalname}`);
};

module.exports = { SingleUpload, handleSingleUpload };
