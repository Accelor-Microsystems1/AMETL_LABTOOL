const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    './uploads',
    './uploads/qualifications',
    './uploads/certificates',
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = './uploads/';
    
    if (file.fieldname.includes('qualification') || file.fieldname.includes('Qualification')) {
      uploadPath = './uploads/qualifications/';
    } else if (file.fieldname.includes('certificate') || file.fieldname.includes('Certificate')) {
      uploadPath = './uploads/certificates/';
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|jpg|jpeg|png/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
  }
};

// Upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Equipment upload fields
const equipmentUpload = upload.fields([
  { name: 'installationQualification', maxCount: 1 },
  { name: 'operationalQualification', maxCount: 1 },
  { name: 'performanceQualification', maxCount: 1 }
]);

// Certificate upload
const certificateUpload = upload.single('certificateFile');

module.exports = {
  upload,
  equipmentUpload,
  certificateUpload
};