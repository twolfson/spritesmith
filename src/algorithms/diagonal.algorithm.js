// Add in diagonal algorithm
function diagonalAlgorithm (item) {
  var x = this.x || 0,
      y = this.y || 0,
      itemWidth = item.width,
      itemHeight = item.height;

  // The item will be saved at the current height
  var saveItem = {
        'x': x,
        'y': y,
        'width': itemWidth,
        'height': itemHeight
      };

  // Increment the x and y
  this.x = x + itemWidth;
  this.y = y + itemHeight;

  // Return the save item
  return saveItem;
}

// Export our algorithm
module.exports = diagonalAlgorithm;