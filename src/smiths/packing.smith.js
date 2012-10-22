function PackingSmith(algorithm) {
  this.packedItems = [];
  this.algorithm = algorithm;
}
PackingSmith.prototype = {
  'addItem': function (name, item) {
    // Add the item
    var coords = this.algorithm(item),
        saveObj = {
          'name': name,
          'coords': coords,
          'item': item
        };
    this.packedItems.push(saveObj);
  },
  'getStats': function () {
    // Get the endX and endY for each item
    var packedItems = this.packedItems,
        endXArr = packedItems.map(function (packedItem) {
          var coords = packedItem.coords;
          return coords.x + coords.width;
        }),
        endYArr = packedItems.map(function (packedItem) {
          var coords = packedItem.coords;
          return coords.y + coords.height;
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
  'exportCoordinates': function () {
    // Extract and return the items as a map
    var packedItems = this.packedItems,
        coordMap = {};

    packedItems.forEach(function (packedItem) {
      var name = packedItem.name;
      coordMap[name] = packedItem.coords;
    });

    return coordMap;
  },
  'exportItems': function () {
    // Extract and return the items as a map
    var packedItems = this.packedItems,
        itemMap = {};

    packedItems.forEach(function (packedItem) {
      var name = packedItem.name,
          item = packedItem.item,
          coords = packedItem.coords;
      itemMap[name] = {
        'item': item,
        'x': coords.x,
        'y': coords.y
      };
    });

    return itemMap;
  }
};

// Export PackingSmith
module.exports = PackingSmith;