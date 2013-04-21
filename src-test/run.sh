# TODO: Probably should move to Makefile?
# DEV: If we move off of .sh, verify that doubleshot is on the path even if not installed
doubleshot --outline src-test/smith.outline.js --content src-test/$1.content.js
