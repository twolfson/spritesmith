function CanvasSmith(canvas) {
  this.canvas = canvas;
}
CanvasSmith.prototype = {
  addImage: function (imgObj) {
    var img = imgObj.meta.img;
    this.canvas.addImage(img, this.x, this.y);
  },
  addImages: function (images) {
    var that = this;
    images.forEach(function addEachImage (img) {
      that.addImage(img);
    });
  },
  export: function (options, cb) {
    this.canvas['export'](options, cb);
  }
};

// Export CanvasSmith
module.exports = CanvasSmith;
