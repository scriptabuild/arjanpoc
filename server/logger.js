const fs = require("fs");


exports = class Logger {
	constructor(filename) {
		this.logStream = fs.createWriteStream(filename, { 'flags': 'a' });
	}

	close(message) {
		this.logStream.end(message);
	}

	appendOut(message) {
		let timestamp = 
		this.logStream.write(`[${timestamp}] ${message}`);
	}

	appendErr(message) {
		this.logStream.write(message);
	}
}
