import Vue from "vue"
import VueRouter from "vue-router"
import ProjectList from "./ProjectList.vue"
import ProjectDetail from "./ProjectDetail.vue"

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
    }
  })
  .redirect({ "*": "/projects" })
  .start({}, "body");
