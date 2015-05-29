import * as fs from 'fs';
import * as path from 'path';

const defaultGulpfileJS = new Buffer(`require('typed-gulp').compile();
`);
const defaultGulpfileTS = new Buffer(`/// <reference path="../node_modules/typed-gulp/release/typings.d.ts" />

import * as gulp from 'typed-gulp';

@gulp.tasks()
class Tasks {
	@gulp.task()
	@gulp.input('lib/**/*', { watch: true })
	@gulp.output('dest/scripts', { clean: true })
	static scripts(task: gulp.TaskInfo) {
		return task.input()
			/* add gulp plugins here */
			.pipe(task.output());
	}
	
	@gulp.task()
	@gulp.deps(Tasks.scripts)
	@gulp.sync()
	static default() {}
}
`);
const defaultTsconfig = new Buffer(`{
	"files": [
		"gulpfile.ts"
	],
	"compilerOptions": {
		"target": "ES5",
		"module": "commonjs"
	}
}
`);

const helpMessage = `
Usage: typed-gulp [command]

Commands:
# typed-gulp init       Initialize a new gulpfile.ts configuration.
# typed-gulp help       Print this message 
`;

function init() {
	// Check if there is an old gulpfile.
	try {
		fs.statSync('gulpfile.js');
		
		console.log('There is already a file called `gulpfile.js`.');
		console.log('Remove or rename that file first.');
		process.exit(1);
	} catch (e) {
		if (e.code !== 'ENOENT') {
			throw e;
		}
	}
	
	// Check if there is a directory `gulp`.
	try {
		fs.statSync('gulp');
		
		console.log('There is already a directory called `gulp`.');
		console.log('Remove or rename that file first.');
		process.exit(1);
	} catch (e) {
		if (e.code !== 'ENOENT') {
			throw e;
		}
	}
	
	// gulpfile.js doesn't exist, so we can create it.
	fs.writeFileSync('gulpfile.js', defaultGulpfileJS);
	fs.mkdirSync('gulp');
	fs.writeFileSync('gulp/gulpfile.ts', defaultGulpfileTS);
	fs.writeFileSync('gulp/tsconfig.json', defaultTsconfig);
}

function help() {
	console.log(helpMessage);
}

switch (process.argv[2]) {
	case 'init':
		init();
		break;
	case 'help':
		help();
		break;
}

