const express = require("express");
const exec = require("child_process").exec;
const bodyparser = require("body-parser");
const _ = require("lodash");

const projects = require("./projects");



var app = express();

app.use("/assets", express.static(__dirname + "/wwwroot", { extensions: ["css", "jpg", "png"] }));

app.get("/", function(req, resp){
	resp.redirect("/app");
})

app.get("/app*", function (req, resp) {
	resp.sendfile(__dirname + "/wwwroot/index.html");
});

app.get("/project-list", function (req, resp) {
	let projects = [
		{
			name: "oktaset cfp Self Service",
			status: "ok"
		}, {
			name: "oktaset cfp Admin",
			status: "ok"
		}, {
			name: "metamory",
			status: "ok"
		}, {
			name: "react-playground",
			status: "failed"
		}, {
			name: "browserify-playground",
			status: "ok"
		}, {
			name: "dotnetcore-playground",
			status: "ok"
		}
	];

	resp.json(projects);
});


// 1. boot the server -> create folders and set up hooks endpoint

app.post("github-hook",
	bodyparser.json(),
	function (req, resp) {

		var postdata = req.body;

		// 2. create workspace, checkout build script, run build script...
	}
);

app.get("dashboard", function (req, resp) {
	// list of projects, statuses, disable/enable, buttons to start/pause/stop a build, link to logs/output
});

app.get("log/:projectId/:version?", function (req, resp) {
	// show latest log
	// allow navigating to other logs
});

app.listen(3000, function () {
	console.log('Scriptabuild http server listening on port 3000!');
});
