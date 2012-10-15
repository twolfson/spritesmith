// TODO: Rename all 'images' to 'item'
function PackingSmith(algorithm) {
  this.images = {};
  this.coords = {};

  // TODO: Load in via .addAlgorithm
  this.algorithm = function (name, img) {
    var y = this.y || 0,
        imgHeight = img.height;

    // The image will be saved at the current height
    var saveImg = {
          'x': 0,
          'y': y,
          'height': img.height,
          'width': img.width
        };

    // Increment the y
    this.y = y + imgHeight;

    // Return the save image
    return saveImg;
  };
}
PackingSmith.prototype = {
  'addImage': function (name, img) {
    // Add the image
    var coords = this.algorithm(name, img),
        saveObj = {
          'name': name,
          'coords': coords,
          'img': img,
          'x': coords.x,
          'y': coords.y
        };
    this.images[name] = saveObj;
    this.coords[name] = coords;
  },
  'exportCoordinates': function () {
    // Return the coordinates
    return this.coords;
  },
  'getStats': function () {
    // Collect each of the coordinates into an array
    var coords = this.coords,
        coordNames = Object.getOwnPropertyNames(coords),
        coordArr = coordNames.map(function (name) {
          return coords[name];
        });

    // Get the endX and endY for each image
    var endXArr = coordArr.map(function (coord) {
          return coord.x + coord.width;
        }),
        endYArr = coordArr.map(function (coord) {
          return coord.y + coord.height;
        });

    // Get the maximums of these
    var retObj = {
          'maxHeight': Math.max.apply(Math, endYArr),
          'maxWidth': Math.max.apply(Math, endXArr)
        };

    // Return the stats
    return retObj;
  },
  'generateCanvas': function (engine, cb) {
    // Grab the stats
    var stats = this.getStats(),
        maxHeight = stats.maxHeight,
        maxWidth = stats.maxWidth;

    // Generate a canvas
    engine.createCanvas(maxWidth, maxHeight, cb);
  },
  'exportItems': function () {
    // Return the images
    return this.images;
  }
};

// Export PackingSmith
module.exports = PackingSmith;