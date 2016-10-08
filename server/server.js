const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const _ = require("lodash");
const Q = require("q");
const path = require("path");

const ensureFolder = require("./blocks/ensureFolder");
const copyFolder = require("./blocks/copyFolder");
const executeTask = require("./blocks/executeTask");
const log = require("./blocks/log");
const block = require("./blocks/block");
const git = require("./blocks/git");
const mark = require("./blocks/mark");

const ensureFolderSync = require("./buildContextUtils/ensureFolderSync");
const {getLatestBuildNoSync} = require("./dataUtils/buildNo");
const createBuildContext = require("./buildContextUtils/createBuildContext");

const getStatusSync = require("./getStatusSync");
const getLogSync = require("./getLogSync");

const config = require("./config");
const projects = require("./projects");



// setup EXPRESS application

var app = express();
app.use("/app", express.static(path.join(__dirname, "wwwroot"), {
	extensions: ["js", "css", "jpg", "png"]
}));

app.use(cors());
// app.use(cors({ allowedOrigins: "*" }));

app.get("/", function (req, resp) {
	resp.redirect("/app/projects");
})

app.get("/app*", function (req, resp) {
	resp.sendFile(__dirname + "/wwwroot/index.html");
});

app.get("/api/project-list",
	function (req, resp) {
		const projects = require("./projects");

		results = _(projects)
			.map(p => {
				let buildNo = getLatestBuildNoSync(config, p);
				let status = getStatusSync(config, p, buildNo);
				return {
					name: p.name,
					status: status.status,
					timestamp: status.timestamp
				};
			})
			.value();

		resp.json(results);
	});

app.get("/api/project-detail/:projectName",
	function (req, resp) {
		let name = req.params.projectName;
		const projects = require("./projects");
		let project = _(projects).find({
			name: name
		});
		let buildNo = getLatestBuildNoSync(config, project);
		let status = getStatusSync(config, project, buildNo);

		let projectDetail = {
			name,
			branch: "master",
			commitHash: "e04c911",
			timestamp: status.timestamp,
			buildStatus: status.status
		};

		resp.json(projectDetail);
	});

app.get("/api/project-log/:projectName",
	function (req, resp) {
		let name = req.params.projectName;
		const projects = require("./projects");
		let project = _(projects).find({
			name: name
		});
		let buildNo = getLatestBuildNoSync(config, project);

		let log = getLogSync(config, project, buildNo);

		resp.json(log);
	});

app.post("/api/project-build/:projectName",
	function (req, resp) {
		let projectName = req.params.projectName;

		// TODO: Trigger the build. Similar to a webhook
		// let commitId;
		// let branchname;

		let project = projects.find(p => p.name == projectName);
		let ctx = createBuildContext(config, project);

		Q(ctx)
			.then(mark.asStarted())
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

app.post("/hook/build/:projectName",
	bodyparser,
	function (req, resp) {
		// TODO: log incoming hook-request, get correct commit and branch, start build process
	});



// Server STARTUP code

console.log("Starting Scriptabuild");
ensureFolderSync(config.logs);
app.listen(3000, function () {
	console.log('Scriptabuild http server listening on port 3000!');
});