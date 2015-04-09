var gulp        = require('gulp');
var browserify  = require('browserify');
var source      = require("vinyl-source-stream");
var coffeeify   = require('coffeeify');
var production  = require('../config').production;
var config      = require('../config').browserify;

gulp.task('browserify-app', function(){
  var b = browserify({
    debug: !production,
    extensions: ['.coffee']
  });
  b.transform(coffeeify);
  b.add(config.app.src);
  return b.bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest(config.app.dest));
});

gulp.task('browserify-iframe', function(){
  var b = browserify({
    debug: !production,
    extensions: ['.coffee']
  });
  b.transform(coffeeify);
  b.add(config.iframe.src);
  return b.bundle()
    .pipe(source('iframe.js'))
    .pipe(gulp.dest(config.iframe.dest));
});

gulp.task('browserify-wrapper', function(){
  var b = browserify({
    debug: !production,
    extensions: ['.coffee']
  });
  b.transform(coffeeify);
  b.add(config.wrapper.src);
  return b.bundle()
    .pipe(source('wrapper.js'))
    .pipe(gulp.dest(config.wrapper.dest));
});



gulp.task('browserify-globals', function(){
  var b = browserify({
    debug: !production
  });
  b.transform(coffeeify);
  b.add(config.globals.src);
  return b.bundle()
    .pipe(source('globals.js'))
    .pipe(gulp.dest(config.globals.dest));
});

gulp.task('browserify', ['browserify-app', 'browserify-globals', 'browserify-iframe']);
