module.exports = [{
  "An array of sprites": {
    "when processed via spritesmith": {
      "renders a top-down spritesheet": true,
      "has the proper coordinates": true
    },
    "when converted from left to right": {
      "renders a left-right spritesheet": true,
      "has the proper coordinates": true
    }
  }
}, {
  "An empty array": {
    "when processed via spritesmith": {
      "renders an empty spritesheet": true,
      "returns an empty coordinate mapping": true
    }
  }
}, {
  // DEV: This only tests the used engine -- this was specific to `gm` + file descriptors
  "A ridiculous amount of sprites": {
    "when processed via spritesmith": {
      "does not crash": true,
      "returns an image": true
    }
  }
}];