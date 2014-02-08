# Spritesmith [![Build status](https://travis-ci.org/Ensighten/spritesmith.png?branch=master)](https://travis-ci.org/Ensighten/spritesmith)

Utility that takes image files and generates [spritesheets](http://en.wikipedia.org/wiki/Sprite_%28computer_graphics%29#Sprites_by_CSS) and coordinate maps.

Once you have satisfied the [requirements](#requirements), spritesmith can be installed via `npm install spritesmith`.

Spritesmith is also available as a [grunt plugin](https://github.com/Ensighten/grunt-spritesmith).

```js
var sprites = ['sprite1.png', 'sprite2.jpg', 'sprite3.png'];
spritesmith({'src': sprites}, function (err, result) {
  result.image; // Binary string representation of image
  result.coordinates; // Object mapping filename to {x, y, width, height} of image
  result.properties; // Object with metadata about spritesheet {width, height}
});
```

## Installation
`spritesmith` can be installed via npm: `npm install spritesmith`

Each engine has system level depedencies. Visit the [requirements section][requirements] for more information.

[requirements]: #requirements

During installation, you may see errors for other engines. These should be ignored unless `npm` crashes.

## Documentation
Spritesmith is a standalone function

```js
/**
 * Spritesmith generation function
 * @param {Object} params Parameters for spritesmith
 * @param {String[]} [params.src] Images to generate into sprite sheet
 * @param {String} [params.engine="auto"] Engine to use
      (phantomjs, canvas, gm, pngsmith or user-defined via Spritesmith.addEngine)
 * @param {String} [params.algorithm="top-down"] Algorithm to pack images with
 * @param {Number} [params.padding] Padding to use between images
 * @param {Mixed} [params.engineOpts] Options to pass through to engine for settings
 * @param {Mixed} [params.exportOpts] Options to pass through to engine for export
 * @param {Function} callback Function that receives compiled spritesheet and map
 * @returns {Mixed} callback[0] err If an error was encountered, this will be returned to callback
 * @returns {Object} callback[1] result Result object of spritesmith
 * @returns {String} callback[1].image Binary string representation of image
 * @returns {Object} callback[1].coordinates Map from file name to an object containing x, y, height, and width information about the source image
 * @returns {Object} callback[1].properties Properties about the spritesheet itself
 * @returns {Object} callback[1].properties.width Width of the spritesheet
 * @returns {Object} callback[1].properties.height Height of the spritesheet
 */
```

### PhantomJS export options
For the `phantomjs` engine, the current output options are:

```js
{
  'timeout': 10000 // Milliseconds to wait until terminating PhantomJS script
}
```

### Canvas export options
For the `canvas` engine, the current output options are:

```js
{
  'format': 'png' // Format to export the canvas to (png or jpeg)
}
```

### gm export options
For the `gm` engine, the current output options are:

```js
{
  'format': 'png', // Format to export the canvas to (png or jpeg)
  'quality': 75 // Quality of the output image
}
```

### Available packing algorithms
The available packing algorithms are: `top-down`, `left-right`, `diagonal` (\\ format), `alt-diagonal` (/ format), `binary-tree` (best packing possible).

### Adding new engines
Example engines can be found in [src/engines](tree/master/src/engines).

New engines can be added via `Spritesmith.addEngine(name, engine);`.

If you decide to build a new engine, there are some utilities in [src/utils](tree/master/src/utils) which may be helpful.

### Adding new packing algorithms
Algorithms are maintained inside of [twolfson/layout](https://github.com/twolfson/layout/). Example algorithms can be found in [twolfson/layout/lib/algorithms](https://github.com/twolfson/layout/tree/master/lib/algorithms).

New algorithms can be added via `Spritesmith.Layout.addAlgorithm(name, algorithm);`.

## Requirements
For cross-platform accessibility, `spritesmith` has and supports multiple sprite engines. However, each of these current engines has a different set of external dependencies.

### pngsmith
The `pngsmith` engine uses [`pngparse`][], an JavaScript `png` parser, to interpret images into [`ndarrays`][]. This requires no additional steps before installation.

**Key differences:** It requires no additional installation steps but you are limited to `.png` files for your source files.

[`pngparse`]: https://github.com/darkskyapp/pngparse
[`ndarrays`]: https://github.com/mikolalysenko/ndarray

### phantomjs
The `phantomjs` engine relies on having [phantomjs][] installed on your machine. Visit [the phantomjs website][phantomjs] for installation instructions.

**Key differences:** `phantomjs` is the easiest engine to install that supports all image formats.

`spritesmith` has been tested against `phantomjs@1.9.0`.

[phantomjs]: http://phantomjs.org/

### canvas
The `canvas` engine uses [node-canvas][] which has a dependency on [Cairo][cairo].

**Key differences:** `canvas` has the best performance (useful for over 100 sprites). However, it is `UNIX` only.

Instructions on how to install [Cairo][cairo] are provided in the [node-canvas wiki][node-canvas-wiki].

Additionally, you will need to install [node-gyp][] for the C++ bindings.
```shell
sudo npm install -g node-gyp
```

[node-canvas]: https://github.com/learnboost/node-canvas
[cairo]: http://cairographics.org/
[node-canvas-wiki]: (https://github.com/LearnBoost/node-canvas/wiki/_pages
[node-gyp]: https://github.com/TooTallNate/node-gyp/

### gm (Graphics Magick / Image Magick)
The `gm` engine depends on [Graphics Magick][graphics-magick] or [Image Magick][image-magick].

**Key differences:** `gm` has the most options for export via `imgOpts`.

[graphics-magick]: http://www.graphicsmagick.org/
[image-magick]: http://imagemagick.org/

For the best results, install from the site rather than through a package manager (e.g. `apt-get`). This avoids potential transparency issues which have been reported.

`spritesmith` has been developed and tested against `1.3.17`.

[Image Magick][image-magick] is implicitly discovered. However, you can explicitly use it via `engineOpts`

```js
{
  'engineOpts': {
    'imagemagick': true
  }
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt](https://github.com/gruntjs/grunt/) and test via `npm test`.

## Donating
Support this project and [others by twolfson][gittip] via [gittip][].

[![Support via Gittip][gittip-badge]][gittip]

[gittip-badge]: https://rawgithub.com/twolfson/gittip-badge/master/dist/gittip.png
[gittip]: https://www.gittip.com/twolfson/

## License
Copyright (c) 2012 - 2013 Ensighten

Licensed under the MIT license.
