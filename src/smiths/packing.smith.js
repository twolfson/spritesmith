function PackingSmith(algorithm) {
  this.items = {};
  this.coords = {};
  this.algorithm = algorithm;
}
PackingSmith.prototype = {
  'addItem': function (name, img) {
    // Add the item
    var coords = this.algorithm(img),
        saveObj = {
          'name': name,
          'coords': coords,
          'img': img,
          'x': coords.x,
          'y': coords.y
        };
    this.items[name] = saveObj;
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

    // Get the endX and endY for each item
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
    // Return the items
    return this.items;
  }
};

// Export PackingSmith
module.exports = PackingSmith;