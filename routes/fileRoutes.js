const express = require("express");
const multer = require("multer");

// Controllers
const GetFiles = require("../controller/GetFiles");
const FileDownload = require("../controller/FileDownload");
const ZipDownload = require("../controller/Zipdownload");
const UploadHandle = require("../controller/UploadHandle");
const ViewFile = require("../controller/ViewFile");
const DeleteFile = require("../controller/DeleteFile");
const Access = require("../controller/Access");
const { SingleUpload, handleSingleUpload } = require("../controller/SimpleUpload");


const router = express.Router();

const upload = multer({
  dest: "./temporary/resource",
});

router.get("/getfiles", GetFiles);
router.get("/filedownload", FileDownload);
router.get("/zipdownload", ZipDownload);
router.get("/access", Access);

router.delete("/deletefile", DeleteFile);
router.post("/upload", upload.single("file"), UploadHandle);
router.post("/simpleupload",SingleUpload, handleSingleUpload);

// working on this one
router.get("/viewfile", ViewFile);

module.exports = router;
