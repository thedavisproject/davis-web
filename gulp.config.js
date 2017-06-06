'use strict';

module.exports = function() {
  var root = './',
    srcRoot = root + 'src/',
    testRoot = root + 'test/',
    config = {
      root: root,
      srcRoot: srcRoot,
      testRoot: testRoot,
      allJs: [
        srcRoot + '**/*.js',
        testRoot + '**/*.js',
        root + '*.js'
      ],
      testFiles: [
        testRoot + '**/*.js'
      ],
      packages: [
        root + 'package.json'
      ]
    };

  return config;
};
