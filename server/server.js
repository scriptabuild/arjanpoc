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
const createBuildContext = require("./buildContextUtils/createBuildContext");
const {	getProjectSandbox } = require("./dataUtils/projectSandbox")
const {	getLatestBuildNoSync } = require("./dataUtils/buildNo");
const {	getBuildSettingsSync } = require("./dataUtils/buildSettings");
const {	getStatusSync } = require("./dataUtils/status");
const { getLogSync } = require("./dataUtils/log");

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
				var projectSandbox = getProjectSandbox(config, p);

				let buildNo = getLatestBuildNoSync(projectSandbox);
				let status = getStatusSync(projectSandbox, buildNo);
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
		const name = req.params.projectName;
		const projects = require("./projects");
		const project = _(projects).find({
			name: name
		});

		const projectSandbox = getProjectSandbox(config, project);
		const buildNo = getLatestBuildNoSync(projectSandbox);
		try{
			var buildSettings = getBuildSettingsSync(projectSandbox, buildNo);
		}
		catch(err){
			buildSettings = { branch: "n/a", commitHash: "n/a"};
		}
		const status = getStatusSync(projectSandbox, buildNo);

		const projectDetail = {
			name,
			branch: buildSettings.branch,
			commitHash: buildSettings.commitHash,
			timestamp: status.timestamp,
			buildStatus: status.status
		};

		resp.json(projectDetail);
	});

app.get("/api/project-log/:projectName/:buildNo?",
	function (req, resp) {
		const name = req.params.projectName;
		const projects = require("./projects");
		const project = _(projects).find({
			name: name
		});

		const projectSandbox = getProjectSandbox(config, project);
		const buildNo = req.params.buildNo || getLatestBuildNoSync(projectSandbox);

		const log = getLogSync(projectSandbox, buildNo);
		
		resp.json({buildNo, log});
	});

app.post("/api/project-build/:projectName",
	function (req, resp) {
		let projectName = req.params.projectName;

		// TODO: Trigger the build. Similar to a webhook
		// let commitId;
		// let branchname;

		let project = projects.find(p => p.name == projectName);
		let branch = undefined;
		let commitHash = undefined;
		let ctx = createBuildContext(config, project);

		Q(ctx)
			.then(mark.asStarted())
			// .then(block(() => setBuildSettings({branch, commitHash}))
			.then(git.load(project, branch, commitHash))
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
ensureFolderSync(path.join(config.workingDirectory, "logs"));
app.listen(config.http.port, function () {
	console.log('Scriptabuild http server listening on port 3000!');
});