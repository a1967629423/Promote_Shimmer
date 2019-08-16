var gulp = require('gulp');
var less = require('gulp-less');
var uglify = require('gulp-uglify-es').default;
function watch(done)
{
  gulp.watch(['static/script/*.js', 'static/style/*.css', 'static/style/*.less'],(done)=>{
    gulp.series(_default)(done);
  })
  done();
}
function script(done)
{
  return gulp.src(['static/script/*.js','static/script/**/*.js'])
  .pipe(uglify().on('error', console.error))
  .pipe(gulp.dest('public/script/')).once('finish',()=>{done()})
}
function _less(done)
{
  return gulp.src(['static/style/*.less'])
  .pipe(less())
  .pipe(gulp.dest('public/style')).once('finish',()=>{
    done()
  });
}
function move_static(done)
{
  return gulp.src([
    'static/images/*.*',
    'static/images/**/*.*', 
    'static/favicon.ico'
  ], { base: './static' })
  .pipe(gulp.dest('public')).once('finish',()=>{done()});
}
function _default(done)
{
  gulp.series(script,_less,move_static)()
  if(done && typeof done === 'function')done();
}
function _dev()
{
  gulp.series(_default,watch)()
  if(done && typeof done === 'function')done();
}
exports.default = _default;
exports.dev = _dev;
exports.watch = watch;