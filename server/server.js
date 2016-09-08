const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const _ = require("lodash");
const Q = require("q");
const createFolder = require("./blocks/createFolder");
const copyFolder = require("./blocks/copyFolder");
const executeTask = require("./blocks/executeTask");
const log = require("./blocks/log");
const _if = require("./blocks/_if");
const block = require("./blocks/block");
const git = require("./blocks/git");
const {
    transform,
    isFile,
    isDirectory
} = require("./utils")
const winston = require("winston");
const fs = require("fs");
const path = require("path");



const config = require("./config");
const projects = require("./projects");

//TODO: Ensure log folder exists
//TODO: Seperate logs for system and project (per project and timestamp - record timestamp, script commit id, project commit id)
var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({ level: "error" }),
        // new winston.transports.File({ filename: `${config.logs}/${project.name}/logfile.json`, level: "silly"})
    ]
});
winston.loggers.add("system");


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

	// TODO: Add information about latest build status for this project (ok/failed/unknown)
	resp.json(_(projects).map(p => ({ name: p.name })).value());
});

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
	// bodyparser,
	function (req, resp) {
		let projectName = req.params.projectName;

		// TODO: Trigger the build. Similar to a webhook
		// - set up logging
		// - write end status to file
		// let commitId;
		// let branchname;

		var project = projects.find(p => p.name == projectName);
		var sandbox = config.workspaces + "/" + escape(project.name);

		Q({})
			// .then(populateBuildConfig(project))  // TODO: Will replace next two steps...
			.then(populateBuildNo(sandbox))
			.then(config => {
				config.paths = {
					sandbox,
					output: sandbox + "/" + config.buildNo,
					build: sandbox + "/build"
				};
				config.transFn = obj => transform(obj, config.paths, 10);

				return config;
			})
			.then(log("Preparing sandbox for project"))
			// .then(config => { console.log(config); return config; })
			.then(createFolder("%build%"))
			.then(log("Loading project into sandbox"))
			.then(git.load(project))

			.then(log("Running tasks"))
			.then(executeTask(project.run))

			.then(log("Copying output files"))
			.then(copyFolder("%build%", "%output%/"))

			.then(log("Scripts completed successfully"))
			// .then(markAsOk())
			// .then(git.tag( ... ))
			// .then(git.push( ... ))
			.catch(err => console.error("Scripts failed", err));


		console.log("*** Starting the build for " + req.params.projectName);
		resp.send("oki!!!");
	});

function populateBuildNo(folderName) {
	return function (config) {
		let readdir = Q.nfbind(fs.readdir);
		return readdir(folderName)
			.then(function (files) {
				files = files
					.filter(n => !isNaN(n))
					.filter(file => fs.statSync(path.join(folderName, file)).isDirectory());

				if (files.length === 0) {
					config.buildNo = 1;
				}
				else {
					var max = Math.max.apply(Math, files);
					config.buildNo = max + 1;
				}

				return config;
			});
	}
}


// app.get("dashboard", function (req, resp) {
// 	// list of projects, statuses, disable/enable, buttons to start/pause/stop a build, link to logs/output
// });

// app.get("log/:projectId/:version?", function (req, resp) {
// 	// show latest log
// 	// allow navigating to other logs
// });




Q({ transFn: obj => obj })
    .then(log("Starting Scriptabuild"))
    .then(createFolder(config.logs))
	.then(() => app.listen(3000, function () {
		console.log('Scriptabuild http server listening on port 3000!');
	}))
    .then(log("Scripts completed successfully"))
    .catch(err => console.error("Scripts failed", err));
