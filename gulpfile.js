var gulp          = require('gulp')
// do not use gulp-load-plugins so that we know our dependencies
var autoprefixer  = require('gulp-autoprefixer')
var changed       = require('gulp-changed')
var connect       = require('connect')
var csso          = require('gulp-csso')
var gutil         = require('gulp-util')
var if_           = require('gulp-if')
var jshint        = require('gulp-jshint')
var jshintStylish = require('jshint-stylish')
var lazypipe      = require('lazypipe')
var livereload    = require('gulp-livereload')
var open          = require('open')
var os            = require('os')
var rimraf        = require('rimraf')
var size          = require('gulp-size')
var template      = require('gulp-template')
var uglify        = require('gulp-uglify')
var useref        = require('gulp-useref')

// context for templates; exposes debug === true for some builds
var config = {
  // config should be overridden in a config target that executes first
  src: gutil.env.src || 'app',
  dst: gutil.env.dst || 'dist',
  port: gutil.env.port || 0,
}

config.html    = config.html    || (config.src + '/*.html')
config.scripts = config.scripts || (config.src + '/scripts/**/*.js')
// copy every non-HTML file from top directory
config.files   = config.files   || [config.src + '/*.*', '!' + config.html]

gulp.task('jshint', function() {
  return gulp.src(config.scripts)
    .pipe(changed('.tmp'))
    .pipe(jshint())
    .pipe(jshint.reporter(jshintStylish))
    .pipe(jshint.reporter('fail'))
    .pipe(size({showFiles: true}))
    .pipe(gulp.dest('.tmp'))
})

gulp.task('html', function() {
  var cssPipeline = lazypipe()
    .pipe(autoprefixer, 'last 1 version', {cascade: true})
    .pipe(csso)

  return gulp.src(config.html)
    .pipe(changed(config.dst))
    .pipe(template(config))
    .pipe(useref.assets())
    // need this to properly report path misconfiguration
    .on('error', gutil.log)
    //.pipe(if_('*.js', uglify()))
    //.pipe(if_('*.css', cssPipeline()))
    .pipe(useref.restore())
    .pipe(useref())
    .pipe(gulp.dest(config.dst))
    .pipe(size({showFiles: true}))
})

gulp.task('copy', function() {
  return gulp.src(config.files)
    .pipe(changed(config.dst))
    .pipe(gulp.dest(config.dst))
    .pipe(size({showFiles: true}))
})

gulp.task('build', ['jshint', 'html', 'copy'])

gulp.task('clean', function(cb) {
  rimraf(config.dst, function() {
    rimraf('.tmp', cb)
  })
})

gulp.task('serve', function(cb) {
  var server = connect()
    .use(connect.static(config.dst))
    .listen(config.port)
    .on('error', function(error) {
      gutil.log(gutil.colors.red('error: ') + 'failed to start server')
      cb(error)
    })
    .on('listening', function() {
      var host = os.hostname()
      var port = this.address().port
      var url  = 'http://' + host + ':' + port
      gutil.log('serving at ' + gutil.colors.magenta(url))
      open(url)
      cb()
    })
})

gulp.task('watch', ['build', 'serve'], function() {
  livereload.listen()
  gulp.watch(config.src + '/**', ['build'])
  gulp.watch(config.dst + '/**').on('change', function(file) {
    livereload.changed(file.path)
  })
})

gulp.task('default', ['build'])

