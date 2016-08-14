import Vue from "vue"
import VueRouter from "vue-router"
import ProjectList from "./ProjectList.vue"
import ProjectDetail from "./ProjectDetail.vue"
import BuildDetail from "./BuildDetail.vue"
import BuildOutput from "./BuildOutput.vue"

Vue.use(VueRouter);

var router = new VueRouter({
  // hashbang: false,
  // history: true,
  // root: "/app"
});

router
  .map({
    "/projects/": {
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
