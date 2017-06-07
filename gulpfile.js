const gulp = require('gulp');
const tasks = require('davis-shared').build;
const config = require('./gulp.config')();
const argv = require('yargs').argv;

gulp.task('test', tasks.test(config.testFiles, argv.ci));

gulp.task('lint', tasks.lint(config.allJs, argv.ci));

gulp.task('watch', function() {
  gulp.watch(config.allJs, ['lint', 'test']);
});

gulp.task('bump', tasks.bump(['./package.json'], argv.level || 'patch'));

gulp.task('default', ['watch', 'lint', 'test']);
