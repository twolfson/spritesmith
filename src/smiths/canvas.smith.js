function CanvasSmith(canvas) {
  this.canvas = canvas;
}
CanvasSmith.prototype = {
  'addImage': function (imgObj) {
    var img = imgObj.meta,
        x = imgObj.x,
        y = imgObj.y,
        canvas = this.canvas;
    canvas.addImage(img, x, y);
  },
  'addImages': function (images) {
    var that = this;
    images.forEach(function (img) {
      that.addImage(img);
    });
  },
  'addImageMap': function (imageMap) {
    var that = this,
        imageNames = Object.getOwnPropertyNames(imageMap);

    // Add the images
    imageNames.forEach(function (name) {
      var image = imageMap[name];
      that.addImage(image);
    });
  },
  'export': function (options, cb) {
    this.canvas['export'](options, cb);
  }
};

// Export CanvasSmith
module.exports = CanvasSmith;