<template>
<span class="prompt">$</span> scriptabuild status --list<br>
	<br>
	<ul>
		<li v-for="project in projects">
			<a v-link="{name: 'project-detail', params: { projectName: project.name}}">
				{{project.name}}
				<span class="status {{project.buildStatusCss}}">{{project.status}}</span>
				{{fromNow(project.timestamp)}}
			</a>
		</li>
	</ul>
</template>

<script>
	import Vue from "vue";
	import _ from "lodash";
	import moment from "moment";
	import pubsub from "./pubsub";

	export default {
		name: "project-list",
		data() {
			return {
				projects: []
			}
		},
		init() {
			fetch("/api/project-list")
				.then(resp => resp.json())
				.then(projects => this.projects = projects)
				.then(() => {
					let styles = {
						"never built": "unknown",
						ok: "ok",
						running: "running",
						unknown: "unknown",
						failed: "failed"
					};
					for (var k in this.projects) {
						Vue.set(this.projects[k], "buildStatusCss", styles[this.projects[k].status]);
					}
				});
			pubsub.on("buildStatusChanged", data => {
				// if(data.buildInfo.projectName == this.$route.params.projectName){
				// 	Vue.set(this.project, "buildStatus", data.buildStatus);					
				// 	Vue.set(this.project, "buildStatusCss", styles[data.buildStatus]);					
				// }
			});
		},
		methods: {
			fromNow: timestamp => timestamp && moment(timestamp).fromNow()
		}
	}
</script>

<style>

</style>