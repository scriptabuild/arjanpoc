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

app.get("/", function (req, resp) {
	resp.redirect("/app/projects");
})

app.get("/app*", function (req, resp) {
	resp.sendFile(__dirname + "/wwwroot/index.html");
});

app.get("/project-list", cors(), function (req, resp) {
	const projects = require("./projects");

	results = _(projects)
		.map(p => ({ name: p.name, buildStatus: getStatusSync(p) }))
		.value();

	resp.json(results);
});

// app.get("dashboard", function (req, resp) {
// 	// list of projects, statuses, disable/enable, buttons to start/pause/stop a build, link to logs/output
// });

// app.get("log/:projectId/:version?", function (req, resp) {
// 	// show latest log
// 	// allow navigating to other logs
// });

app.get("/project-detail/:projectName",
	cors(),
	function (req, resp) {
		let projectName = req.params.projectName;
		const projects = require("./projects");
		let project = _(projects).find({ name: projectName })

		// TODO: Add information about latest 1 or 2 build status for this project (if ok -> latest statusreport) or (if failed -> latest statusreport + last ok statusreport)
		let projectDetail = {

		};

		resp.json(project);
	});

// app.use(cors({ allowedOrigins: "*" }));
app.post("/project-build/:projectName",
	cors(),
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

function getLogger(filename){
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

function getStatusSync(project) {
	var latestBuildNo = getLatestBuildNoSync(project);
	if (latestBuildNo === 0) return "never built";

	var sandbox = config.workspaces + "/" + escape(project.name);

	let filename = path.join(sandbox, latestBuildNo.toString(), "buildstatus.txt");
	let fd = fs.openSync(filename, "r");
	let status = fs.readFileSync(fd);
	fs.close(fd);

	if (status == "completed") return "ok";
	if (!status) return "unknown";
	return status.toString();
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

