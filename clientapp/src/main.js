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
    // "/project/:projectName/build/:buildId": {
    //   name: "build-detail",
    //   component: BuildDetail
    // },
    "/project/:projectName/build/:buildId": {
      name: "build-logs",
      component: BuildOutput
    }
  })
  .redirect({ "*": "/projects" })
  .start({}, "body");


var location = window.location;
var wsProtocol = location.protocol == "http:" ? "ws" : "wss";
var exampleSocket = new WebSocket(`${wsProtocol}://${location.host}`, "protocolOne");

 
exampleSocket.onmessage = function (event) {
  let data = JSON.parse(event.data);
  pubsub.emit(data.messageType, data.messagePayload);
}