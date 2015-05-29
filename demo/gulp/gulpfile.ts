import * as gulp from '../../release/main';

@gulp.tasks()
class Tasks {
	@gulp.task()
	@gulp.input('lib/**/*.txt', { watch: true })
	@gulp.output('dest/scripts', { clean: true })
	static scripts(task: gulp.TaskInfo) {
		return task.input()
			.pipe(task.output());
	}
	
	@gulp.task()
	@gulp.input('lib/**/*.css', { watch: true })
	@gulp.output('dest/styles', { clean: true })
	static styles(task: gulp.TaskInfo) {
		return task.input()
			.pipe(task.output());
	}
	
	@gulp.task()
	@gulp.deps(Tasks.scripts)
	@gulp.sync()
	static default() {}
}
