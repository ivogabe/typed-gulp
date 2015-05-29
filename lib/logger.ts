import * as chalk from 'chalk';

const prefix = '[' + chalk.gray('typed-gulp') + '] ';

export function log(message: string) {
	console.log(prefix + message);
}
export function error(message: string) {
	console.error(prefix + chalk.red(message));
}