const express = require("express");
const server = require('http').createServer();
const url = require('url');
const WebSocketServer = require('ws').Server;
const cors = require("cors");
const bodyparser = require("body-parser");

const _ = require("lodash");
const Q = require("q");
const path = require("path");
const moment = require("moment");

const fs = require("fs");

const ensureFolder = require("./blocks/ensureFolder");
const copyFolder = require("./blocks/copyFolder");
const executeTask = require("./blocks/executeTask");
const log = require("./blocks/log");
const block = require("./blocks/block");
const git = require("./blocks/git");
const mark = require("./blocks/mark");

const ensureFolderSync = require("./buildContextUtils/ensureFolderSync");
const createBuildContext = require("./buildContextUtils/createBuildContext");
const getConfig = require("./buildContextUtils/getConfig");
const {	getProjectSandbox } = require("./dataUtils/projectSandbox")
const {	getLatestBuildNoSync } = require("./dataUtils/buildNo");
const {	getBuildSettingsSync } = require("./dataUtils/buildSettings");
const {	getStatusSync } = require("./dataUtils/status");
const {	getLogSync } = require("./dataUtils/log");

const config = getConfig();
const projects = require(config.projectsConfigurationFile);


// setup WS application
const wss = new WebSocketServer({server});

wss.on('connection', function connection(ws) {
	var location = url.parse(ws.upgradeReq.url, true);
	// you might use location.query.access_token to authenticate or share sessions
	// or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

	ws.on('message', function incoming(message) {
		console.log('received: %s', message);
	});

});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
	console.log("WS send", JSON.stringify(data));
    client.send(JSON.stringify(data));
  });
};


// setup EXPRESS application
const app = express();

app.use("/app/", express.static(path.join(__dirname, "wwwroot")));

app.use(cors());
// app.use(cors({ allowedOrigins: "*" }));

app.get("/", function (req, resp) {
	resp.redirect("/app/projects");
})

app.get("/app/*", function (req, resp) {
	resp.sendFile(__dirname + "/wwwroot/index.html");
});

app.get("/api/project-list",
	function (req, resp) {
		results = _(projects)
			.map(p => {
				var projectSandbox = getProjectSandbox(config, p);

				let buildNo = getLatestBuildNoSync(projectSandbox);
				let status = getStatusSync(projectSandbox, buildNo);
				return {
					name: p.name,
					buildStatus: status.status,
					timestamp: status.timestamp
				};
			})
			.value();

		resp.json(results);
	});

app.get("/api/project-detail/:projectName",
	function (req, resp) {
		const name = req.params.projectName;
		const project = _(projects).find({ name });

		const projectSandbox = getProjectSandbox(config, project);
		const buildNo = getLatestBuildNoSync(projectSandbox);
		const buildSettings = getBuildSettingsSync(projectSandbox, buildNo);
		const status = getStatusSync(projectSandbox, buildNo);

		const projectDetail = {
			name,
			branch: buildSettings.branch,
			commitHash: buildSettings.commitHash,
			buildNo,
			timestamp: status.timestamp,
			buildStatus: status.status
		};

		resp.json(projectDetail);
	});

app.get("/api/project-log/:projectName/:buildNo?",
	function (req, resp) {
		const name = req.params.projectName;
		const project = _(projects).find({ name });

		const projectSandbox = getProjectSandbox(config, project);
		const buildNo = req.params.buildNo || getLatestBuildNoSync(projectSandbox);

		const log = getLogSync(projectSandbox, buildNo);

		resp.json({ buildNo, log });
	});

app.post("/api/project-build/:projectName",
	function (req, resp) {
		let projectName = req.params.projectName;

		// TODO: Trigger the build. Similar to a webhook
		let pathspec = "HEAD";

		let project = projects.find(p => p.name == projectName);
		let ctx = createBuildContext(config, project);

		let buildInfo = {pathspec, projectName, buildNo: ctx.paths.buildNo};

		wss.broadcast({messageType: "buildStatusChanged", messagePayload:{buildInfo, buildStatus: "running"}});

		Q(ctx)
			.then(mark.asStarted())
			.then(git.load(project, pathspec))
			.then(executeTask(project.run))
			// .then(log("Copying output files"))
			// .then(copyFolder("%build%", "%output%/"))
			.then(log("Scripts completed successfully"))
			.then(mark.asCompleted())
			// .then(git.tag( ... ))
			// .then(git.push( ... ))
			.then(block(ctx => {
				wss.broadcast({messageType: "buildStatusChanged", messagePayload:{buildInfo, buildStatus: "ok"}});
			}))
			.catch(err => {
				ctx.logger.error(err);
				console.error("Scripts failed", err);
				mark.asFailed()(ctx);

				wss.broadcast({messageType: "buildStatusChanged", messagePayload:{buildInfo, buildStatus: "failed"}});
			});


		console.log("*** Starting the build for " + req.params.projectName);
		resp.send("oki!!!");
	});

app.all("/hook/build/:projectName",
	bodyparser.json(),
	function (req, resp) {
		let projectName = req.params.projectName;
		
		// TODO: Get correct commit and branch, start build process

		// TODO: Remove the logging when it is no longer neccessary
		console.log(req.method, req.path, req.params);
		console.log(req.body);

		let project = projects.find(p => p.name == projectName);
		let ctx = createBuildContext(config, project);
		let filename = path.join(ctx.paths.sandbox, ctx.paths.buildNo.toString(), "hook-data.json");
		let fd = fs.openSync(filename, "w");
		fs.writeSync(fd, JSON.stringify({
			method: req.method,
			path: req.path,
			params: req.params,
			body: req.body
		}));
		fs.close(fd);

		resp.send("oki!!!");
	});



// Server STARTUP code

console.log("Starting Scriptabuild");
ensureFolderSync(path.join(config.workingDirectory, "logs"));

server.on('request', app);
server.listen(config.http.port, function () {
 	console.log('Scriptabuild http server listening on port ' + server.address().port);
});