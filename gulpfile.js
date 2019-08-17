var gulp = require('gulp');
var less = require('gulp-less');
var uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');
function watch(done)
{
  gulp.watch(['static/script/*.js','static/script/**/*.js'],(done)=>{
    gulp.parallel(script)(done)
  });
  gulp.watch(['static/style/*.css','static/style/*.less'],(done)=>{
    gulp.parallel(_less)(done)
  });
  gulp.watch(['static/images/*.*',
  'static/images/**/*.*', 
  'static/favicon.ico'],(done)=>{
    gulp.parallel(move_static)(done);
  })
  done();
}
function script(done)
{
  return gulp.src(['static/script/*.js','static/script/**/*.js'])
  .pipe(babel({presets:['@babel/env']}).on('error',console.error))
  .pipe(uglify().on('error', console.error))
  .pipe(gulp.dest('public/script/')).once('finish',()=>{done()})
}
function _less(done)
{
  Promise.all([new Promise((res)=>{
    gulp.src(['static/style/*.less','static/style/**/*.less'])
    .pipe(less())
    .pipe(gulp.dest('public/style')).once('finish',()=>{
      res()
    });
  }),new Promise((res)=>{
    gulp.src(['static/style/*.css','static/style/**/*.css'])
    .pipe(gulp.dest('public/style')).once('finish',()=>{
      res();
    })
  })]).then(v=>{
    done();
  })
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
  gulp.parallel(script,_less,move_static)()
  if(done && typeof done === 'function')done();
}
function _dev()
{
  gulp.parallel(_default,watch)()
  if(done && typeof done === 'function')done();
}
exports.default = _default;
exports.dev = _dev;
exports.watch = watch;