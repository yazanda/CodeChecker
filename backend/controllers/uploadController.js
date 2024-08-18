const multer = require('multer');
const { bucket } = require('../utils/firebase');
const upload = multer({ storage: multer.memoryStorage() });

const uploadFiles = async (req, res) => {
  console.log(req);
  const userId = req.body.userId;
  const assId = req.body.assId;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).send('No files uploaded');
  }

  try {
    const uploadPromises = files.map(file => {
      const folderName = `st${userId}-as${assId}/${file.originalname}`;
      const fileUpload = bucket.file(folderName);

      const options = {
        resumable: true,
        timeout: 60000, // 60 seconds
        metadata: {
          contentType: file.mimetype,
        },
      };

      return fileUpload.save(file.buffer, options);
    });

    await Promise.all(uploadPromises);

    res.status(200).send('Files uploaded successfully');
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).send('Failed to upload files');
  }
};

module.exports = { upload, uploadFiles };
