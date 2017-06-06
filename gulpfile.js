var gulp = require('gulp'),
  tasks = require('davis-shared').build,
  config = require('./gulp.config')(),
  argv = require('yargs').argv;

gulp.task('test', tasks.test(config.testFiles));
gulp.task('lint', tasks.lint(config.allJs));
gulp.task('watch', function() {
  gulp.watch(config.allJs, ['lint', 'test']);
});
gulp.task('bump', tasks.bump(['./package.json'], argv.level || 'patch'));
gulp.task('default', ['watch', 'lint', 'test']);
