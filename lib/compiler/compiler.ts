/// <reference path="../../node_modules/typescript/bin/typescript.d.ts" />

import * as path from 'path';
import * as fs from 'fs';
import * as ts from 'typescript';
import * as chalk from 'chalk';
import * as del from 'del';
import * as logger from '../logger';

const lastBuildinfoFileName = 'gulp-dest/last-build.json';

interface BuildinfoFile {
	time: number,
	files: string[]
}

function shouldCompile(): [boolean, BuildinfoFile] {
	let files: string[];
	try {
		files = fs.readdirSync('gulp');
	} catch (e) {
		return [true, undefined];
	}
	
	let time = files.map(fileName => +fs.statSync(path.join('gulp', fileName)).mtime)
		.reduce((a, b) => a >= b ? a : b);
	
	let newFile: BuildinfoFile = {
		time,
		files
	};
	
	try {
		const content = JSON.parse(fs.readFileSync(lastBuildinfoFileName).toString());
		
		if (content.time < time) {
			throw new Error('Compile');
		}
		
		if (files.length !== content.files.length) {
			throw new Error('Compile');
		}
		
		for (let i = 0; i < files.length; i++) {
			if (content.files.indexOf(files[i]) === -1) {
				throw new Error('Compile');
			}
		}
		
		return [false, undefined];
	} catch (e) {
		return [true, newFile];
	}
}

function compileSources(fileNames: string[], options: ts.CompilerOptions, newBuildinfoFile: BuildinfoFile): boolean {
	const program = ts.createProgram(fileNames, options);
	const emitResult = program.emit();
	const allDiagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);

	allDiagnostics.forEach(diagnostic => {
		const codeAndMessageText = ts.DiagnosticCategory[diagnostic.category].toLowerCase() +
            ' TS' +
            diagnostic.code +
            ': ' +
            ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
		
		if (diagnostic.file) {
			const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			console.error(chalk.red(`${diagnostic.file.fileName} (${line + 1},${character + 1}): `) + codeAndMessageText);
		} else {
			console.error(codeAndMessageText);
		}
	});
	
	if (allDiagnostics.length === 0 && newBuildinfoFile) {
		fs.writeFileSync(lastBuildinfoFileName, JSON.stringify(newBuildinfoFile));
	}

	return !emitResult.emitSkipped;
}

export function compile() {
	let should = shouldCompile();
	
	let compileResult = true;
	
	if (should[0] === true) {
		logger.log('Compiling your gulpfile.ts');
		
		del.sync('gulp-dest/**/*.ts');
		
		compileResult = compileSources(['gulp/gulpfile.ts'], {
			noImplicitAny: true,
			target: ts.ScriptTarget.ES5,
			module: ts.ModuleKind.CommonJS,
			rootDir: 'gulp',
			outDir: 'gulp-dest'
		}, should[1]);
	}
	
	if (!compileResult) {
		// failed
		logger.error('Compiling your gulpfile.ts from TypeScript to JavaScript failed.');
		logger.error('See above for more details.');
	} else {
		require(path.join(process.cwd(), 'gulp-dest/gulpfile.js'));
	}
}
