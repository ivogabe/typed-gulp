declare module 'merge2' {
	function merge(...streams: (NodeJS.ReadableStream | NodeJS.ReadableStream[])[]);
	export = merge;
}