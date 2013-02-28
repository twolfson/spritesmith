var fs = require('fs'),
    path = require('path'),
    scratchDir = path.join(__dirname, '../../scratch');

try { fs.mkdirSync(scratchDir); } catch (e) {}

/**
 * Scratch file maker
 * @constructor
 * @param {String} ext Extension for the file
 */
function ScratchFile(ext) {
  // Generate our name and path
  var now = +new Date(),
      rand = Math.random(),
      filename = now + '.' + rand + '.' + ext,
      filepath = path.join(scratchDir, filename);

  // Save the name and path
  this.filename = filename;
  this.filepath = filepath;
}
ScratchFile.prototype = {
  // Destroy the scratch file
  'destroy': function (cb) {
    var filepath = this.filepath;
    fs.unlink(filepath, cb);
  }
};

// Generate our exports
module.exports = {
  // I know -- every time this code runs, god kills a kitten
  'streamToString': function streamToString (stream, cb) {
    // Generate imgData to store chunks
    var imgData = [],
        errOccurred = false;

    // On data, add it to imgData
    // Note: We must save in 'binary' since utf8 strings don't support any possible character that a file might use
    stream.on('data', function (chunk) {
      var binaryStr = chunk.toString('binary');
      imgData.push(binaryStr);
    });

    // DEV: Originally, this collected errors for stream.on('end') but Cairo won't callback on error =(
    // On error
    stream.on('error', function (err) {
      // If this is the first error
      if (!errOccurred) {
        // Make a note that it occurred and callback
        errOccurred = true;
        cb(err);
      } else {
      // Otherwise, abandon ship and notify the user
        console.error('MULTIPLE SPRITESMTIH ERRORS: ', err);
      }
    });

    // When complete
    stream.on('end', function () {
      // If there was an error, do nothing (callback already fired)
      if (errOccurred) {
        return;
      }

      // Otherwise, join together image data and callback
      var retStr = imgData.join('');
      cb(null, retStr);
    });
  },
  'ScratchFile': ScratchFile
};