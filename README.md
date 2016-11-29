# scriptabuild

The scriptable build system

## Configuration and first run

``` bash
npm install -g scriptabuild
```

Open `config.json` to configure working directory and http port for server


``` bash
node node_modules/scriptabuild/server/server.js http.port:3001 projectsConfigurationFile:/Users/arjan/Documents/dev/scriptabuild/projects.json workingDirectory:/Users/arjan/Documents/dev/test/t1/ws1
```

??? TODO: how to add and configure a project ???


## Build Setup

Clone this repository
 
``` bash
node server/server.js
```


See separate [README.md](clientapp/README.md) file in the `clientapp` folder for building the client app or running it while developing.

