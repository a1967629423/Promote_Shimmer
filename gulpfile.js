var gulp = require('gulp');
var cleanCss = require('gulp-clean-css');
var less = require('gulp-less');
var watch = require('gulp-watch');
var uglify = require('gulp-uglify-es').default;

gulp.task('watch', function () {
  watch([
    'static/script/*.js', 'static/style/*.css', 'static/style/*.less'
  ], function (done) {
    gulp.start('default');
    done()
  });
});

gulp.task('script', function(done) {
    gulp.src(['static/script/*.js','static/script/**/*.js'])
      .pipe(uglify().on('error', console.error))
      .pipe(gulp.dest('public/script/')).once('finish',()=>{done()})
  });


gulp.task('less', function (done) {
  gulp.src(['static/style/*.less'])
    .pipe(less())
    .pipe(gulp.dest('public/style')).once('finish',()=>{
      done()
    });
});

gulp.task('move-static', function (done) {
  gulp.src([
    'static/images/*.*',
    'static/images/**/*.*', 
    'static/favicon.ico'
  ], { base: './static' })
    .pipe(gulp.dest('public')).once('finish',()=>{done()});
});

gulp.task('default', gulp.series('script','less','move-static'));

gulp.task('dev', gulp.series('default','watch'));