// Add in top-down algorithm
function topDownAlgorithm (item) {
  var y = this.y || 0,
      itemHeight = item.height;

  // The item will be saved at the current height
  var saveItem = {
        'x': 0,
        'y': y,
        'width': item.width,
        'height': itemHeight
      };

  // Increment the y
  this.y = y + itemHeight;

  // Return the save item
  return saveItem;
}

// Export our algorithm
module.exports = topDownAlgorithm;