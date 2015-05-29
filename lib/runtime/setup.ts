import { Tasks, Task, Input, Output } from './task';
import * as gulp from 'gulp';
import * as del from 'del';
import merge = require('merge2');

export function setupTasks(exports: Tasks) {
	let allTasks: Task[] = [];
	
	function setTaskNames(obj: Tasks, prefix: string) {
		const seperator = '-';
		const prefixWithSeperator = prefix === '' ? '' : (prefix + seperator);
		
		if (obj.__groups) {
			for (const groupName of obj.__groups) {
				setTaskNames(obj[groupName], prefixWithSeperator + Task.toTaskName(groupName));
			}
		}
		
		for (const name in obj) {
			const task = <Task> obj[name];
			
			if (typeof task !== 'function' || !task.isTask) continue;
			
			allTasks.push(task);
			
			if (name === 'default' && prefix !== '') {
				// Use 'group' instead of 'group-default' as task name.
				task.taskName = prefix;
			} else {
				task.taskName = prefixWithSeperator + Task.toTaskName(name);
			}
		}
	}
	
	setTaskNames(exports, '');
	
	function getTaskFunction(task: Task) {
		return (done: () => void) => {
			const info = {
				done,
				input() {
					return merge(task.input.map(input => gulp.src(input.paths, input.options)));
				},
				output() {
					if (task.output.length === 1 && task.output[0].paths.length === 1) {
						return gulp.dest(
							task.output[0].paths[0],
							Output.getGulpOptions(task.output[0].options)
						);
					} else {
						throw new Error('You can only use task.output() if the task has a single output destination. Use gulp.dest(...) instead.');
					}
				}
			};
			if (task.sync) {
				task(info);
				info.done();
			} else {
				return task(info);
			}
		};
	}
	function getCleanTaskFunction(task: Task) {
		const outputArray = task.output
			.filter(output => output.options.clean)
			.map(output => output.paths);
		
		if (outputArray.length === 0) return;
		
		const outputPaths = outputArray.reduce((previous, current) => previous.concat(current));
		
		return (done: () => void) => {
			del(outputPaths, done);
		}
	}
	function getWatchFunction(task: Task) {
		const inputArray = task.input
			.filter(input => input.options.watch)
			.map(input => input.paths);
		
		if (inputArray.length === 0) return;
		
		const inputPaths = inputArray.reduce((previous, current) => previous.concat(current));
		
		return () => {
			gulp.watch(inputPaths, [task.taskName]);
		};
	}
	
	/* function getRecursiveAllInput(task: Task) {
		let input: string[] = [];
		const visited: Task[] = [];
		const loopTaskInput = (task: Task) => {
			if (visited.indexOf(task) !== -1) return; // Circular dependencies!
			visited.push(task);
			input = input.concat(
				task.input
					.map(item => item.paths)
					.reduce((previous, current) => previous.concat(current))
			);
			for (const dependency of task.dependencies) {
				loopTaskInput(dependency);
			}
		};
		loopTaskInput(task);
		return input;
	} */
	
	for (const task of allTasks) {
		let dependencies: (string | Task)[] = [];
		const watchDependencies: Task[] = task.dependencies
			.filter(dependency => !!(dependency.input && dependency.input.length));
		
		if (task.output && task.output.length) {
			const cleanFunction = getCleanTaskFunction(task);
			if (cleanFunction) {
				gulp.task('clean-' + task.taskName, cleanFunction);
				dependencies.push('clean-' + task.taskName);
			}
		}
		
		if (task.input && task.input.length) {
			const watchFunction = getWatchFunction(task);
			if (watchFunction) {
				gulp.task('watch-' + task.taskName/*, [task.taskName]*/, watchFunction);
			}
		}
		
		dependencies = dependencies.concat(task.dependencies);
		const dependencyNames = dependencies.map(dependency => {
			if (typeof (<Task>dependency).taskName === 'string') {
				return (<Task> dependency).taskName;
			}
			return <string> dependency;
		});
		
		gulp.task(task.taskName, dependencyNames, getTaskFunction(task));
	}
}
