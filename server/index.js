var express = require("express");
var exec = require("child_process").exec;
var bodyparser = require("body-parser");

var app = express();

// 1. boot the server -> create folders and set up hooks endpoint

app.post("github-hook",
	bodyparser.json(),
	function(req, resp) {

		var postdata = req.body;

		// 2. create workspace, checkout build script, run build script...
	}
);

app.get("dashboard", function(req, resp){
	// list of projects, statuses, disable/enable, buttons to start/pause/stop a build, link to logs/output
});

app.get("log/:projectId/:version?", function(req, resp){
	// show latest log
	// allow navigating to other logs
});

app.listen(3000, function () {
  console.log('Scriptabuild http server listening on port 3000!');
});
