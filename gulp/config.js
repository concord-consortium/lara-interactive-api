var argv = require('yargs').argv,
    production = !!argv.production,
    buildInfo = argv.buildInfo || 'development build (' + (new Date()) + ')',
    src = './src',
    dest  = production ? './dist' : './dev';

module.exports = {
  production: production,
  buildInfo: buildInfo,
  css: {
    watch: src + '/stylus/**/*.styl',
    src: src + '/stylus/**/*.styl',
    dest: dest + '/css/'
  },
  browserify: {
    app: {
      watch: [src + '/code/**/*.*', '!' + src + '/code/globals.coffee'],
      src: src + '/code/app.coffee',
      dest: dest + '/js/'
    },
    iframe: {
      watch: [src + '/code/**/*.*', '!' + src + '/code/globals.coffee'],
      src: src + '/code/iframe.coffee',
      dest: dest + '/js/'
    },
    saver: {
      watch: [src + '/code/**/*.*', '!' + src + '/code/globals.coffee'],
      src: src + '/code/global-saver.coffee',
      dest: dest + '/js/'
    },
    globals: {
      watch: src + '/code/globals.coffee',
      src: src + '/code/globals.coffee',
      dest: dest + '/js/'
    },
    userInfo: {
      watch: [src + '/code/**/*.*', '!' + src + '/code/globals.coffee'],
      src: src + '/code/interactives/user-info.coffee',
      dest: dest + '/js/interactives/'
    },
    toggleForwardNav: {
      watch: [src + '/code/**/*.*', '!' + src + '/code/globals.coffee'],
      src: src + '/code/interactives/toggle-forward-nav.coffee',
      dest: dest + '/js/interactives/'
    }
  },
  coffeelint: {
    watch: src + '/code/**/*.coffee',
    src: src + '/code/**/*.coffee',
  },
  assets: {
    watch: src + '/assets/**/*.*',
    src: src + '/assets/**/*.*',
    dest: dest
  },
  vendor: {
    watch: src + '/vendor/**/*.*',
    src: src + '/vendor/**/*.*',
    dest: dest + '/js/'
  }
};
