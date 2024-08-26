const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

class FileService {

  moveFile(srcFile, destFile) {
    
    const src = fs.createReadStream(srcFile.path);
    const dest = fs.createWriteStream(destFile);
    src.pipe(dest);
  }

  moveFileWithRandomName(id, srcFile, destDir, oldFile) {
    if (!destDir.endsWith('/'))
      destDir += '/';

    // Deleting the old file if it exists.
    if (oldFile) {
      fs.unlink(destDir + '/' + oldFile, (err) => {
        // ignore the error because if the file doesn't exist we don't
        // then it is already effectively deleted.
      });
    }

    const extension = srcFile.mimetype.split('/').pop();
    const randomSrcName = id + '-' + uuidv4() + '.' + extension;
    this.moveFile(srcFile, destDir + '/' + randomSrcName);
    
    return randomSrcName.substring(randomSrcName.indexOf('-') + 1);
  }

  fixStoredFile(id, file, fileDir, defaultPath) {
    if (fileDir) {
      if (!fileDir.endsWith('/'))
        fileDir += '/';
    } else {
      fileDir = "";      
    }

    if (file) {
      return fileDir + id + '-' + file;
    } else {
      return defaultPath || null;
    }
  }
}

module.exports = new FileService();