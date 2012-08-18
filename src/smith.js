var async = require('async'),
    fs = require('fs');

// Generate the spritesmith function
function Spritesmith(files, callback) {
  async.map(files, function (file, cb) {
    fs.readFile(file, 'utf8', cb);
  }, function (err, files) {
    console.log(files);
    callback('2');
  });
}

// Export Spritesmith
module.exports = Spritesmith;