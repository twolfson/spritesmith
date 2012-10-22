// Add in left-right algorithm
function leftRightAlgorithm (item) {
  var x = this.x || 0,
      itemWidth = item.width;

  // The item will be saved at the current height
  var saveItem = {
        'x': x,
        'y': 0,
        'width': itemWidth,
        'height': item.height
      };

  // Increment the x
  this.x = x + itemWidth;

  // Return the save item
  return saveItem;
}

// Export our algorithm
module.exports = leftRightAlgorithm;