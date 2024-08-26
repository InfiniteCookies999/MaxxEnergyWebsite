const HttpError = require("./http.error");

const fileFilter = (mimetypes) => {
  return (req, file, cb) => {
    const mimetype = file.mimetype;
    if (mimetypes.includes(mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
      cb(new HttpError(`Invalid file type. Expected files: ${mimetypes}`));
    }
  };
};

module.exports = fileFilter;