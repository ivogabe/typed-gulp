var gulp = require('gulp');
var ts = require('gulp-typescript');
var del = require('del');
var merge = require('merge2');
var dts = require('dts-generator');
var footer = require('gulp-footer');

var tsProject = ts.createProject('lib/tsconfig.json', { typescript: require('typescript') });

var typingsFooter =
	'declare module \'typed-gulp\' {\n' +
	'\texport * from \'__typed-gulp/main\';\n' +
	'}\n';

gulp.task('clean-scripts', function(done) {
	del('release', done);
});

gulp.task('scripts', ['scripts-copy-typings']);

gulp.task('scripts-build', ['clean-scripts'], function() {
	var tsResult = gulp.src('lib/**/*.ts')
		.pipe(ts(tsProject));
	
	return merge([
		tsResult.js.pipe(gulp.dest('release')),
		tsResult.dts.pipe(gulp.dest('release'))
	]);
});
gulp.task('scripts-generate-typings', ['scripts-build'], function(done) {
	dts.generate({
		name: '__typed-gulp',
		baseDir: './release',
		files: [ 'main.d.ts', 'runtime/task.d.ts', 'runtime/decorators.d.ts', 'compiler/compiler.d.ts' ],
		out: 'release/typings.d.ts',
		externs: ['typings/gulp/gulp.d.ts']
	}).then(function() {
		gulp.src('release/typings.d.ts')
			.pipe(footer(typingsFooter))
			.pipe(gulp.dest('release'))
			.on('finish', done);
	});
});
gulp.task('scripts-copy-typings', ['scripts-generate-typings'], function() {
	return gulp.src('lib/**/*.d.ts').pipe(gulp.dest('release'));
});

gulp.task('default', ['scripts']);
