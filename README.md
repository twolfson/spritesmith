# spritesmith [![Build status](https://travis-ci.org/Ensighten/spritesmith.png?branch=master)](https://travis-ci.org/Ensighten/spritesmith)

Convert images into [spritesheets][] and coordinate maps.

[spritesheets]: http://en.wikipedia.org/wiki/Sprite_%28computer_graphics%29#Sprites_by_CSS

`spritesmith` is also available as:

- [grunt plugin](https://github.com/Ensighten/grunt-spritesmith)
- [gulp plugin](https://github.com/twolfson/gulp.spritesmith)
- [CLI utility](https://github.com/bevacqua/spritesmith-cli)

A folder of icons processed by `spritesmith`:

![Fork icon][fork-icon] ![+][]
![GitHub icon][github-icon] ![+][]
![Twitter icon][twitter-icon] ![=][]

[fork-icon]: docs/fork.png
[github-icon]: docs/github.png
[twitter-icon]: docs/twitter.png
[+]: docs/plus.png
[=]: docs/equals.png

generates a spritesheet:

![spritesheet](docs/spritesheet.png)

and a coordinate map:

```js
{
  "/home/todd/github/spritesmith/docs/fork.png": {
    "x": 0,
    "y": 0,
    "width": 32,
    "height": 32
  },
  "/home/todd/github/spritesmith/docs/github.png": {
    "x": 32,
    "y": 0,
    "width": 32,
    "height": 32
  },
  // ...
}
```

## Getting started
`spritesmith` can be installed via npm: `npm install spritesmith`

```js
// Load in dependencies
var spritesmith = require('spritesmith');

// Generate our spritesheet
var sprites = ['fork.png', 'github.png', 'twitter.png'];
spritesmith({src: sprites}, function handleResult (err, result) {
  result.image; // Binary string representation of image
  result.coordinates; // Object mapping filename to {x, y, width, height} of image
  result.properties; // Object with metadata about spritesheet {width, height}
});
```

## Documentation
`spritesmith` exports a `spritesmith` function as its `module.exports`.

If you would like a faster build time or need to support an obscure image format, see `params.engine`.

If you would like to adjust how images are laid out, see `params.algorithm` and `params.algorithmOpts`.

// TODO: Link these

// TODO: Use link in documentation instead of this inline list for algorithms and engines

// TODO: Add examples with algorithms and whatnot

### `spritesmith(params, callback)`
Utility that takes images and generates a spritesheet, coordinate map, and spritesheet info

- params `Object` Container for paramters
    - params.src `String[]` Array of filepaths for images to include in spritesheet
    - params.padding `Number` Padding to use between images
        - For example if `2` is provided, then there will be a `2px` gap to the right and bottom between each image
    - params.engine `String|Object` Optional engine override to use
        - By default we use [`pixelsmith`][], a node-based `spritesmith` engine
        - //  TODO: Link me
        - For more engine options, see the [Engines section][]
    - params.engineOpts `Object` Options to pass through to engine for settings
        - For example `phantomjssmith` accepts `timeout` via `{engineOpts: {timeout: 10000}}`
        - See your engine's documentation for available options
    - params.exportOpts `Mixed` Options to pass through to engine for export
        - For example `gmsmith` supports `quality` via `{exportOpts: {quality: 75}}`
        // TODO: Verify `gmsmith` and others list their available export options
        - See your engine's documentation for available options
    - params.algorithm `String` Optional algorithm to pack images with
        - By default we use `top-down` which packs images vertically from smallest (top) to largest (bottom)
        - // TODO: Link me and consider and linking directly to layout
        - For more algorithm options, see the [Algorithms section][]
    - params.algorithmOpts `Object` Optional algorithm options to pass through to algorithm for layout
        - For example `top-down` supports ignoring sorting via `{algorithmOpts: {sort: false}}`
        // TODO: Add sort: false documentation to `layout`
        - See your algorithm's documentation for available options
- callback `Function` Error-first function that receives compiled spritesheet and map
    - `callback` should have signature `function (err, result)`
    - err `Error|null` If an error occurred, this will be it
    - result `Object` Container for result items
        - result.image `String` Binary string representation of image
        - result.coordinates `Object` Map from filepath to coordinate information between original sprite and spritesheet
            - `filepath` will be the same as provided in `params.src`
            - result.coordinates[filepath] `Object` Container for coordinate information
                // TODO: The excessive dot notation seems repetitive
                - result.coordinates[filepath].x `Number` Horizontal position of top-left corder of original sprite on spritesheet
                - result.coordinates[filepath].y `Number` Vertical position of top-left corder of original sprite on spritesheet
                - result.coordinates[filepath].width `Number` Width of original sprite
                - result.coordinates[filepath].height `Number` Height of original sprite
        - result.properties `Object` Container for information about spritesheet
            - result.properties.width `Number` Width of the spritesheet
            - result.properties.height `Number` Height of the spritesheet

### Available packing algorithms
The available packing algorithms are: `top-down`, `left-right`, `diagonal` (\\ format), `alt-diagonal` (/ format), `binary-tree` (best packing possible).

#### `algorithmOpts`
All algorithms provide the current options:

```js
{
  sort: false // Stops sorting of images (default for all algorithms)
}
```

// TODO: Relocate information into `spritesmith-engine-test`
### Adding new engines
Engine specifications can be found in [spritesmith-engine-test][].

[spritesmith-engine-test]: https://github.com/twolfson/spritesmith-engine-test

New engines can be added via `Spritesmith.addEngine(name, engine);`.

Some existing engines are:

- [canvassmith](https://github.com/twolfson/canvassmith)
- [pngsmith](https://github.com/twolfson/pngsmith)
- [phantomjssmith](https://github.com/twolfson/phantomjssmith)
- [gmsmith](https://github.com/twolfson/gmsmith)

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
  engineOpts: {
    imagemagick: true
  }
}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via `npm run lint` and test via `npm test`.

## Donating
Support this project and [others by twolfson][gratipay] via [gratipay][].

[![Support via Gratipay][gratipay-badge]][gratipay]

[gratipay-badge]: https://cdn.rawgit.com/gratipay/gratipay-badge/2.x.x/dist/gratipay.png
[gratipay]: https://www.gratipay.com/twolfson/

## License
Copyright (c) 2012 - 2014 Ensighten

Licensed under the MIT license.
