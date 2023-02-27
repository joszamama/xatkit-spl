const multer = require('multer');

// Define storage settings for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'flama/fm')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});

// Define file filter function
const fileFilter = function (req, file, cb) {
  // check if the file ends with .uvl
  if (!file.originalname.match(/\.uvl$/)) {
    console.log('File must be a .uvl file');
    cb(new Error('File must be a .uvl file'), false);
  } else if (req.body.title.includes(' ')) {
    cb(new Error('Title must not contain spaces'), false);
  } else {
    cb(null, true);
  }
}

// Create a Multer instance with the storage and file filter settings
const Uploader = multer({ storage: storage, fileFilter: fileFilter });

module.exports = Uploader;