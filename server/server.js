const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const _ = require("lodash");
const Q = require("q");
const createFolder = require("./blocks/ensureFolder");
const copyFolder = require("./blocks/copyFolder");
const executeTask = require("./blocks/executeTask");
const log = require("./blocks/log");
const _if = require("./blocks/_if");
const block = require("./blocks/block");
const git = require("./blocks/git");
const mark = require("./blocks/mark");
const {
    transform
    // isFile,
    // isDirectory
} = require("./utils")
const winston = require("winston");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const config = require("./config");
const projects = require("./projects");

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: "error" }),
        // new winston.transports.File({ filename: `${config.logs}/${project.name}/logfile.json`, level: "silly"})
    ]
});
winston.loggers.add("system");


// setup EXPRESS application

var app = express();
app.use("/app", express.static(__dirname + "/wwwroot", { extensions: ["js", "css", "jpg", "png"] }));
app.use(cors());
// app.use(cors({ allowedOrigins: "*" }));

app.get("/", function (req, resp) {
	resp.redirect("/app/projects");
})

app.get("/app*", function (req, resp) {
	resp.sendFile(__dirname + "/wwwroot/index.html");
});

app.get("/project-list",
	function (req, resp) {
		const projects = require("./projects");

		results = _(projects)
			.map(p => {
				let buildNo = getLatestBuildNoSync(p);
				let status = getStatusSync(p, buildNo);
				return { name: p.name, status: status.status, timestamp: status.timestamp };
			})
			.value();

		resp.json(results);
	});

app.get("/project-detail/:projectName",
	function (req, resp) {
		let name = req.params.projectName;
		const projects = require("./projects");
		let project = _(projects).find({ name: name });
		let buildNo = getLatestBuildNoSync(project);
		let status = getStatusSync(project, buildNo);

		let projectDetail = {
			name,
			branch: "master",
			commitHash: "e04c911",
			timestamp: status.timestamp,
			buildStatus: status.status
		};

		resp.json(projectDetail);
	});

app.get("/project-log/:projectName",
	function (req, resp) {
		let name = req.params.projectName;
		const projects = require("./projects");
		let project = _(projects).find({ name: name });
		let buildNo = getLatestBuildNoSync(project);

		let log = getLogSync(project, buildNo);

		resp.json(log);
	});

app.post("/project-build/:projectName",
	function (req, resp) {
		let projectName = req.params.projectName;

		// TODO: Trigger the build. Similar to a webhook
		// - set up logging
		// let commitId;
		// let branchname;

		let project = projects.find(p => p.name == projectName);
		let ctx = createBuildContext(project);


		Q(ctx)
			.then(createFolder("%output%"))
			.then(ctx => {
				ctx.logger = getLogger(ctx.transFn("%output%/log.txt"));
				return ctx;
			})
			.then(git.load(project))
			.then(executeTask(project.run))
			// .then(log("Copying output files"))
			// .then(copyFolder("%build%", "%output%/"))
			.then(log("Scripts completed successfully"))
			.then(mark.asCompleted())
			// .then(git.tag( ... ))
			// .then(git.push( ... ))
			.catch(err => {
				ctx.logger.error(err);
				console.error("Scripts failed", err);
				mark.asFailed()(ctx);
				ctx.logger
			});

		console.log("*** Starting the build for " + req.params.projectName);
		resp.send("oki!!!");
	});





function createBuildContext(project) {
	let sandbox = config.workspaces + "/" + escape(project.name);
	let buildNo = getLatestBuildNoSync(project) + 1;

	let paths = {
		sandbox,
		buildNo,
		build: path.join(sandbox, "build"),
		output: path.join(sandbox, buildNo.toString())
	};

	let ctx = {
		project,
		paths,
		logger: winston.loggers.get("system"),
		transFn: obj => transform(obj, paths, 10)
	};

	return ctx;
}

function getLogger(filename) {
	return new (winston.Logger)({
		level: "info",
		transports: [
			new (winston.transports.Console)(),
			new (winston.transports.File)({ filename })
		]
	});
}

function getLatestBuildNoSync(project) {
	var sandbox = config.workspaces + "/" + escape(project.name);
	try {
		var files = fs.readdirSync(sandbox)
		files = files
			.filter(n => !isNaN(n))
			.filter(file => fs.statSync(path.join(sandbox, file)).isDirectory());

		if (files.length === 0) {
			return 0;
		}
		return Math.max.apply(Math, files);
	}
	catch (err) {
		return 0;
	}
}

function getStatusSync(project, buildNo = 0) {
	if (buildNo === 0) return { status: "never built", timestamp: null };
	var sandbox = config.workspaces + "/" + escape(project.name);

	let filename = path.join(sandbox, buildNo.toString(), "buildstatus.txt");
	let stat = fs.statSync(filename);
	let timestamp = stat.mtime;
	let fd = fs.openSync(filename, "r");
	let status = fs.readFileSync(fd);
	fs.close(fd);

	if (status == "completed") return { status: "ok", timestamp };
	if (!status) return { status: "unknown", timestamp };
	return { status: status.toString(), timestamp };
}

function getLogSync(project, buildNo = 0) {
	if (buildNo === 0) return [];
	var sandbox = config.workspaces + "/" + escape(project.name);

	let filename = path.join(sandbox, buildNo.toString(), "log.txt");

	let log = fs.readFileSync(filename).toString().split("\n")
		.filter(line => line)
		.map(line => {
			console.log(line);
			return JSON.parse(line);
		});

	return log;
}




// Server STARTUP code
Q({ transFn: obj => obj })
    .then(log("Starting Scriptabuild"))
    .then(createFolder(config.logs))
	.then(() => app.listen(3000, function () {
		console.log();
		console.log('Scriptabuild http server listening on port 3000!');
		console.log();
	}))
    .then(log("Scripts completed successfully"))
    .catch(err => console.error("Scripts failed", err));

