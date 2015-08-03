/*jslint node: true */

module.exports = function(config) {
  'use strict';

  config.set({

    basePath: '../',

    files: [
      // Vendors; do not change order
      'test/vendors/jquery.min.js', // TODO: Replace with bower dependencies
      'test/vendors/angular.min.js',
      'test/vendors/angular-cookies.min.js',
      'test/vendors/angular-mocks.js',
      'test/vendors/angular-sanitize.min.js',
      'test/vendors/socket.io.min.js',
      'test/vendors/bootstrap.min.js',

      // Source files
      'src/app.js',
      'src/*/*.js',
      'src/index.html',

      // Test files
      //'test/utils/**/*.js',
      'test/specs/**/*Spec.js'
    ],

    autoWatch: true,

    frameworks: ['jasmine'],

    //browsers: ['Chrome'],
    browsers: ['PhantomJS'],

    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine'
      //'karma-chrome-launcher'
    ],
    reporters: ['progress'],
    singleRun: true
  });
};
