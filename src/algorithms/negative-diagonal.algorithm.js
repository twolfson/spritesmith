// Add in negative-diagonal algorithm (this is more of a litmus test than practical)
function negativeDiagonalAlgorithm (item) {
  var x = this.x || 0,
      y = this.y || 0,
      itemWidth = item.width,
      itemHeight = item.height;

  // The item will be saved at the current height
  var saveItem = {
        'x': x - itemWidth,
        'y': y - itemHeight,
        'width': itemWidth,
        'height': itemHeight
      };

  // Decrement the x and y
  this.x = x - itemWidth;
  this.y = y - itemHeight;

  // Return the save item
  return saveItem;
}

// Export our algorithm
module.exports = negativeDiagonalAlgorithm;