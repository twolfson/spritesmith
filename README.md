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

Contributing
------------
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via [grunt][grunt] and test via `npm test`.

License
-------
Copyright (c) 2012 Ensighten
Licensed under the MIT license.