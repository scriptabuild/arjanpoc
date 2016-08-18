const express = require("express");
const cors = require("cors");
const exec = require("child_process").exec;
const bodyparser = require("body-parser");
const _ = require("lodash");




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

	resp.json(_(projects).map(p => ({ name: p.name, status: "ok" })).value());
});

app.get("/project-detail/:projectName",
	cors(),
	function (req, resp) {
		let projectName = req.params.projectName;
		const projects = require("./projects");
		let project = _(projects).find({ name: projectName })

		resp.json(project);
	});

// app.use(cors({ allowedOrigins: "*" }));
app.post("/project-build/:projectName",
	cors(),
	// bodyparser,
	function (req, resp) {
		let commitId;
		let branchname;
		// TODO: Trigger the build. Similar to a webhook
		// - create or reuse workspace folder(s)
		// - create build folder (folder name contains timestamp + commitid + branch?)
		// - set up logging
		// - git clone/pull + npm update + run scripts
		// - write end status to file




		console.log("Starting the build for " + req.params.projectName);
		resp.send("oki!!!");
	});

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
