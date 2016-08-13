const express = require("express");
const exec = require("child_process").exec;
const bodyparser = require("body-parser");
const _ = require("lodash");




var app = express();

app.use("/assets", express.static(__dirname + "/wwwroot", { extensions: ["css", "jpg", "png"] }));

app.get("/", function (req, resp) {
	resp.redirect("/app");
})

app.get("/app*", function (req, resp) {
	resp.sendFile(__dirname + "/wwwroot/index.html");
});

app.get("/project-list", function (req, resp) {
	const projects = require("./projects");

	resp.json(_(projects).map(p => {return { name: p.name, status: "ok" };}) );
});

app.get("/project-detail/:projectName", function (req, resp) {
	let project =
		{
			name: "oktaset cfp Self Service",
			status: "ok",
			builds: [
				{
					commitId: "52b8775",
					date: "2016-08-01T12:00:00+02:00",
					status: "ok"
				},
				{
					commitId: "5ace85c",
					date: "2016-08-01T11:58:22+02:00",
					status: "failed"
				}
			]
		};

	resp.json(project);
});

// app.post("/project-build/:projectName", function(req, resp){
// 	// Trigger the build. Similar to a webhook
// });

// // 1. boot the server -> create folders and set up hooks endpoint

// app.post("github-hook",
// 	bodyparser.json(),
// 	function (req, resp) {

// 		var postdata = req.body;

// 		// 2. create workspace, checkout build script, run build script...
// 	}
// );

// app.get("dashboard", function (req, resp) {
// 	// list of projects, statuses, disable/enable, buttons to start/pause/stop a build, link to logs/output
// });

// app.get("log/:projectId/:version?", function (req, resp) {
// 	// show latest log
// 	// allow navigating to other logs
// });

app.listen(3000, function () {
	console.log('Scriptabuild http server listening on port 3000!');
});
