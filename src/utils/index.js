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
        err = "";

    // On data, add it to imgData
    // Note: We must save in 'binary' since utf8 strings don't support any possible character that a file might use
    stream.on('data', function (chunk) {
      var binaryStr = chunk.toString('binary');
      imgData.push(binaryStr);
    });

    // On error, save it
    stream.on('error', function (_err) {
      err += _err;
    });

    // When complete
    stream.on('end', function () {
      // If there was an error, callback with it
      if (err) {
        cb(err);
      } else {
      // Otherwise, join together image data, put it into the retObj
        var retStr = imgData.join('');

        // Callback with no error
        cb(null, retStr);
      }
    });
  },
  'ScratchFile': ScratchFile
};