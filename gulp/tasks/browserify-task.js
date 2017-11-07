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

gulp.task('browserify-saver', function(){
  var b = browserify({
    debug: !production,
    extensions: ['.coffee']
  });
  b.transform(coffeeify);
  b.add(config.saver.src);
  return b.bundle()
    .pipe(source('global-saver.js'))
    .pipe(gulp.dest(config.saver.dest));
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

gulp.task('browserify-user-info', function(){
  var b = browserify({
    debug: !production,
    extensions: ['.coffee']
  });
  b.transform(coffeeify);
  b.add(config.userInfo.src);
  return b.bundle()
    .pipe(source('user-info.js'))
    .pipe(gulp.dest(config.userInfo.dest));
});

gulp.task('browserify-toggle-forward-nav', function(){
  var b = browserify({
    debug: !production,
    extensions: ['.coffee']
  });
  b.transform(coffeeify);
  b.add(config.toggleForwardNav.src);
  return b.bundle()
    .pipe(source('toggle-forward-nav.js'))
    .pipe(gulp.dest(config.toggleForwardNav.dest));
});

gulp.task('browserify', ['browserify-app', 'browserify-globals', 'browserify-iframe', 'browserify-user-info', 'browserify-toggle-forward-nav']);
