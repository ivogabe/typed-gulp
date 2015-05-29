export interface Tasks {
	__groups?: string[];
}
export interface Task {
	(task: TaskInfo): void; // Or Stream or Promise
	taskName?: string;
	isTask?: boolean;
	dependencies?: Task[];
	input?: Input[];
	output?: Output[];
	sync?: boolean;
}
export module Task {
	export function convert(task: Task) {
		if (task.isTask) return;
		
		task.isTask = true;
		task.dependencies = [];
		task.input = [];
		task.output = [];
	}
	
	/**
	 * Convert names like 'fooBar' to 'foo-bar'.
	 */
	export function toTaskName(str: string) {
		let result = '';
		for (let i = 0; i < str.length; i++) {
			const char = str[i];
			const charLower = char.toLowerCase()
			if (i !== 0 && charLower !== char) {
				result += '-';
			}
			result += charLower;
		}
		return result;
	}
}

export interface TaskInfo {
	done: () => void;
	input: () => NodeJS.ReadWriteStream;
	output: () => NodeJS.ReadWriteStream;
}

function copyObject(obj: Object, excludeKeys: string[]) {
	const result: Object = {};
	for (var key of Object.keys(obj)) {
		if (excludeKeys.indexOf(key) !== -1) continue;
		
		result[key] = obj[key];
	}
	return result;
}

export interface Input {
	paths: string[];
	options: Input.Options;
}
export module Input {
	export interface Options extends gulp.ISrcOptions {
		watch?: boolean;
	}
	export function getGulpOptions(options: Options): Options {
		return copyObject(options, ['watch']);
	}
}

export interface Output {
	paths: string[];
	options: Output.Options;
}
export module Output {
	export interface Options extends gulp.IDestOptions {
		clean?: boolean;
	}
	export function getGulpOptions(options: Options): Options {
		return copyObject(options, ['clean']);
	}
}
