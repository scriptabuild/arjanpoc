
class Logger{
	constructor(logger){
		this.logger = logger;
		this.level = (logger.level || 0) + 1
	}

	begin(name){
		this.name = name;
		this.logger.log(`${this.level} ┏━━━━ Starting ${this.name}`);
		// console.log(`${this.level} ┏━━━━ Starting ${this.name}`);
	}

	log(message){
		this.logger.log(`${this.level} ┃ ${message}`);
		// console.log(`${this.level} ┃ ${message}`);
	}

	end(){
		this.logger.log(`${this.level} ┗━━━━ Ending ${this.name}`);	
		// console.log(`${this.level} ┗━━━━ Ending ${this.name}`);	
	}
}




let rootLogger = new Logger(console);
rootLogger.begin("outer")

let logger1 = new Logger(rootLogger);
logger1.begin("copy this file bla bla bla");
logger1.log("This happens inside");
logger1.end();

let logger2 = new Logger(rootLogger);
logger2.begin("copy this file bla bla bla");
logger2.log("This happens inside");
let logger3 = new Logger(logger2);
logger3.begin("copy this file bla bla bla");
logger3.log("This happens inside");
logger3.end();

logger2.end();

rootLogger.end();

