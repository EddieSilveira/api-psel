const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    if (file.mimetype === 'image/jpeg') {
      cb(null, Date.now() + '.jpg');
    }
    if (file.mimetype === 'image/png') {
      cb(null, Date.now() + '.png');
    }
  },
});

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), async (req, res) => {
  res.json({
    file: req.file,
  });
});

module.exports = router;
