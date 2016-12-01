#!/usr/bin/env node

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
const load = require("./dataUtils/load");

const config = getConfig();
//const projects = require(config.projectsConfigurationFile);
const projects = load.json(path.resolve(process.cwd(), config.projectsConfigurationFile));


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



app.post("/api/project-build/:projectname",
	function (req, resp) {
		let projectname = req.params.projectname;

		let pathspec = "HEAD";
		build(projectname, pathspec);

		resp.sendStatus(200);
	});



app.post("/api/hook/bitbucket/",
	jsonBodyParser(),
	function (req, resp) {
		let projectName = req.body.repository.name;
		let commitHash = req.body.changesets.values[0].toCommit.id;
		//let author = req.body.changesets.values[0].toCommit.author;

		// TODO: Remove the logging when it is no longer neccessary
		console.log(req.method, req.path, req.params);
		console.log(req.body);

		let project = projects.find(p => p.name == projectName);
		if(!project){
			// TODO: Auto register project in projects.json
			return resp.sendStatus(404);
		}

		let ctx = createBuildContext(config, project);
		let filename = path.join(ctx.paths.sandbox, ctx.paths.buildNo.toString(), "hook-data.json");
		let fd = fs.openSync(filename, "w");
		fs.writeSync(fd, JSON.stringify({
			method: req.method,
			path: req.path,
			params: req.params,
			headers: req.headers,
			body: req.body
		}));
		fs.close(fd);

		build(projectname, commitHash);

		resp.sendStatus(200);
	});


function build(projectname, pathspec){

	let project = projects.find(p => p.name == projectname);
	let ctx = createBuildContext(config, project);

	let buildInfo = {pathspec, projectname, buildNo: ctx.paths.buildNo};

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

	console.log();
	console.log("*** Starting the build for " + projectname);
}



app.all("/api/hook/record",
	rawBodyParser(),
	function (req, resp) {
		console.log(req.method, req.path, req.params);
		console.log(req.headers);
		console.log(req.body);

		let parentfolder = path.join(config.workingDirectory, "recordings");
		let buildNo = getLatestBuildNoSync(parentfolder) + 1;
		let folder = path.join(parentfolder, buildNo.toString());
		ensureFolderSync(folder);

		let hookDataFilename = path.join(folder, "hook-data.json");
		let fd1 = fs.openSync(hookDataFilename, "w");
		fs.writeSync(fd, JSON.stringify({
			method: req.method,
			path: req.path,
			params: req.params,
			headers: req.headers,
			body: req.body
		}));
		fs.close(fd1);

		let requstBodyFilename = path.join(folder, "request-body.txt");
		let fd2 = fs.openSync(requstBodyFilename, "w");
		fs.writeSync(fd, req.body);
		fs.close(fd2);

		resp.sendStatus(200);
	});

function rawBodyParser(){
	return function(req, resp, next) {
		let data = "";

		req.on("data", c => data += c);
		req.on("end", () => {
			req.body = data;
			next();
		});
	}
}

function jsonBodyParser(){
	return function(req, resp, next) {
		let data = "";

		req.on("data", c => data += c);
		req.on("end", () => {
			req.body = JSON.parse(data);
			next();
		});
	}
}

// Server STARTUP code

console.log("Starting Scriptabuild");
ensureFolderSync(path.join(config.workingDirectory, "logs"));
// ensureFolderSync(path.join(config.workingDirectory, "recordings"));

server.on('request', app);
server.listen(config.http.port, function () {
 	console.log('Scriptabuild http server listening on port ' + server.address().port);
});

