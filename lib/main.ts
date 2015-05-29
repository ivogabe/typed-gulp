/// <reference path="typings/tsd.d.ts" />
export { src, dest } from 'gulp';
export { compile } from './compiler/compiler';
export { task, deps, input, output, sync, group, tasks } from './runtime/decorators';
export { TaskInfo, Input, Output } from './runtime/task';
