Spritesmith
===========
Utility that takes image files and generates [spritesheets](http://en.wikipedia.org/wiki/Sprite_%28computer_graphics%29#Sprites_by_CSS) and coordinate maps.

Requirements
------------
Spritesmith supports multiple sprite engines however all of the current engines require external software to be installed.

As a result, you must either have [Cairo](http://cairographics.org/) or [Graphics Magick](http://www.graphicsmagick.org/) installed for Spritesmith to run properly.

### Cairo (node-canvas)
Due to dependance on [node-canvas](https://github.com/learnboost/node-canvas), you must install [Cairo](http://cairographics.org/).

Instructions on how to do this are provided in the [node-canvas wiki](https://github.com/LearnBoost/node-canvas/wiki/_pages).

Additionally, you will need to install [node-gyp](https://github.com/TooTallNate/node-gyp/)
```shell
sudo npm install -g node-gyp
```

### Graphics Magick (gm)
The alternative engine is [gm](https://github.com/aheckmann/gm) which runs on top of [Graphics Magick](http://www.graphicsmagick.org/).

I have found it is best to install from the site rather than through a package manager (e.g. `apt-get`) to get the latest as well as without transparency issues.

Documentation
-------------
Spritesmith is a standalone function
```
/**
 * Spritesmith generation function
 * @param {Object} params Parameters for spritesmith
 * @param {String[]} [params.src] Images to generate into sprite sheet
 * @param {String} [params.engine="auto"] Engine to use (canvas, gm, or user-defined via Spritesmith.addEngine)
 * @param {String} [params.algorithm="top-down"] Algorithm to pack images with (top-down or user-defined via Spritesmith.addAlgorithm)
 * @param {Mixed} [params.exportOpts] Options to pass through to engine for export
 * @param {Function} callback Function that receives compiled spritesheet and map
 * @returns {Mixed} callback[0] err If an error was encountered, this will be returned to callback
 * @returns {Object} callback[1] result Result object of spritesmith
 * @returns {String} callback[1].image Binary string representation of image
 * @returns {Object} callback[1].coordinates Map from file name to an object containing x, y, height, and width information about the source image
 */
```

### Canvas export options
For the `canvas` engine, the current output options are:
```
{
  'format': 'png' // Format to export the canvas to (png or jpeg)
}
```

### gm export options
For the `gm` engine, the current output options are:
```
{
  'format': 'png', // Format to export the canvas to (png or jpeg)
  'quality': 75 // Quality of the output image
}
```

### Available packing algorithms
There is a bunch of packing algorithms available: `top-down`, `bottom-up`, `left-right`, `right-left`, `diagonal`, `negative-diagonal`, `reverse-diagonal`.

### Adding new engines
Example engines can be found in [src/engines](tree/master/src/engines).

New engines can be added via `Spritesmith.addEngine(name, engine);`.

If you decide to build a new engine, there are some utilities in [src/utils](tree/master/src/utils) which may be helpful.

### Adding new packing algorithms
Example algorithms can be found in [src/algorithms](tree/master/src/algorithms).

New algorithms can be added via `Spritesmith.addAlgorithm(name, algorithm);`.

Examples
--------
```
var sprites = ['sprite1.png', 'sprite2.jpg', 'sprite3.png'];
spritesmith({'src': sprites}, function (err, result) {
  result.image; // Binary string representation of image
  result.coordinates; // Object mapping filename to {x, y, width, height} of image
});
```

Contributing
------------
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt/) and test via `npm test`.

License
-------
Copyright (c) 2012 Ensighten
Licensed under the MIT license.