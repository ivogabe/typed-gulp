import { toArray } from './utils';
import { Tasks, Task, Input, Output } from './task';
import { setupTasks } from './setup';

export function task(): MethodDecorator {
	return (target, propertyKey: string, descriptor: TypedPropertyDescriptor<Task>) => {
		let task: Task = descriptor.value;
		Task.convert(<Task> task);
	};
}

export function deps(...values: Task[]): MethodDecorator {
	return (target, propertyKey: string, descriptor: TypedPropertyDescriptor<Task>) => {
		let task: Task = descriptor.value;
		Task.convert(task);
		
		task.dependencies = task.dependencies.concat(values);
	};
}

export function input(value: string | string[], options: Input.Options = {}): MethodDecorator {
	return (target, propertyKey: string, descriptor: TypedPropertyDescriptor<Task>) => {
		let task: Task = descriptor.value;
		Task.convert(task);
		
		task.input.push({
			paths: toArray(value),
			options
		});
	};
}

export function output(value: string | string[], options: Output.Options = {}): MethodDecorator {
	return (target, propertyKey: string, descriptor: TypedPropertyDescriptor<Task>) => {
		let task: Task = descriptor.value;
		Task.convert(task);
		
		task.output.push({
			paths: toArray(value),
			options
		});
	};
}

export function sync(): MethodDecorator {
	return (target, propertyKey: string, descriptor: TypedPropertyDescriptor<Task>) => {
		let task: Task = descriptor.value;
		Task.convert(task);
		
		task.sync = true;
	};
}

export function group(): PropertyDecorator {
	return (target: Tasks, propertyKey: string) => {
		if (!target.__groups) {
			target.__groups = [propertyKey];
		} else {
			target.__groups.push(propertyKey);
		}
	};
}

export function tasks(): ClassDecorator {
	return (target: Function) => {
		setupTasks(target);
	};
}
