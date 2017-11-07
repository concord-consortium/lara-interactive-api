var gulp = require('gulp');
var config = require('../config');

gulp.task('watch', function() {
    gulp.watch(config.css.watch,                 ['css']);
    gulp.watch(config.coffeelint.watch,          ['coffeelint']);
    gulp.watch(config.browserify.app.watch,      ['browserify-app']);
    gulp.watch(config.browserify.iframe.watch,   ['browserify-iframe']);
    gulp.watch(config.browserify.saver.watch,    ['browserify-saver']);
    gulp.watch(config.browserify.globals.watch,  ['browserify-globals']);
    gulp.watch(config.browserify.userInfo.watch, ['browserify-user-info']);
    gulp.watch(config.browserify.toggleForwardNav.watch, ['browserify-toggle-forward-nav']);
    gulp.watch(config.assets.watch,              ['assets']);
    gulp.watch(config.vendor.watch,              ['vendor']);
});

gulp.task('build-all', ['coffeelint', 'browserify-app', 'browserify-globals',
  'browserify-iframe', 'browserify-saver', 'browserify-user-info', 'browserify-toggle-forward-nav', 'css', 'assets', 'vendor']);

gulp.task('default', ['build-all', 'watch']);
