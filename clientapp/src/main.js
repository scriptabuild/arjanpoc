require('es6-promise').polyfill();

import Vue from "vue";
import VueRouter from "vue-router";
import ProjectList from "./ProjectList.vue";
import ProjectDetail from "./ProjectDetail.vue";
import BuildDetail from "./BuildDetail.vue";
import BuildOutput from "./BuildOutput.vue";
import pubsub from "./pubsub";

Vue.use(VueRouter);

var router = new VueRouter({
  hashbang: false,
  history: true,
  root: "/app"
});

router
  .map({
    "/projects": {
      name: "projects-list",
      component: ProjectList
    },
    "/project/:projectName": {
      name: "project-detail",
      component: ProjectDetail
    },
    // "/project/:projectName/build/:commitId": {
    //   name: "build-detail",
    //   component: BuildDetail
    // },
    "/project/:projectName/build/:commitId": {
      name: "build-logs",
      component: BuildOutput
    }
  })
  .redirect({ "*": "/projects" })
  .start({}, "body");


var exampleSocket = new WebSocket("ws://" + location.host, "protocolOne");
// exampleSocket.onopen = function (event) {
//   // exampleSocket.send("Here's some text that the server is urgently awaiting!"); 
// };

exampleSocket.onmessage = function (event) {
  let data = JSON.parse(event.data);
  pubsub.emit(data.messageType, data.messagePayload);
}