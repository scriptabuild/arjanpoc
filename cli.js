#!/usr/bin/env node
  
var program = require('commander');
 
program
  .version('0.0.1')
  .option('--server', 'Start Scriptabuild Server')
  .option('--init', 'Create config.json and projects.json for the Scriptabuild server')
  .option('-b, --build', 'Build locally')
  .option('--export')
  .parse(process.argv);
 
if (program.server) {
	console.log('Starting Scriptabuild server');
	require("./server/server");
	return;
}

if (program.init){
	console.log('Initializing');
}

if (program.build){
	console.log('Building locally');
}