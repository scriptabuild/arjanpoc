# scriptabuild

The scriptable build system

## Configuration and first run

1. Install scriptabuild
	``` bash
	npm install -g scriptabuild
	```
2. Create a `projects.json` file.
	``` json
	[
		{
			"name": "Scriptabuild",
			"source": {
				"provider": "git",
				"url": "https://github.com/scriptabuild/arjanpoc"
			},
			"run": [
				"npm update",
				"npm run ci-task"
			]
		}
	]
	```

3. Create a `config.js` file if you need other values than the default values. (Sample includes default values)
	``` json
	{
		http: {port: 80},
		workingDirectory: "./scrab",
		projectsConfigurationFile: "./projects.json"		
	}
	```

4. Run `scriptabuild` from that same directory.
	...OR start and configure everything on the command line
	``` bash
	scriptabuild http.port:3001 projectsConfigurationFile:/Users/arjan/Documents/dev/scriptabuild/projects.json workingDirectory:/Users/arjan/Documents/dev/test/t1/ws1
	```


## Build Setup

1. Clone this repository
2. Run the server
	``` bash
	node server/server.js
	```

Note: See separate [README.md](clientapp/README.md) file in the `clientapp` folder for building the client app or running it while developing.

