<template>
<span class="prompt">$</span> scriptabuild status --list<br>
	<br>
	<ul>
		<li v-for="project in projects">
			<a v-link="{name: 'project-detail', params: { projectName: project.name}}">
				{{project.name}}
				<span class="status {{project.buildStatusCss}}">{{project.buildStatus}}</span>
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

	let styles = {
		"never built": "unknown",
		ok: "ok",
		running: "running",
		unknown: "unknown",
		failed: "failed"
	};

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
					for (var k in this.projects) {
						Vue.set(this.projects[k], "buildStatusCss", styles[this.projects[k].buildStatus]);
					}
				});
			pubsub.on("buildStatusChanged", data => {
				let project = _.find(this.projects, {name: data.buildInfo.projectName});

				Vue.set(project, "buildNo", data.buildInfo.buildNo);					
				Vue.set(project, "buildStatus", data.buildStatus);					
				Vue.set(project, "buildStatusCss", styles[data.buildStatus]);					
				Vue.set(project, "timestamp", moment());	
			});
		},
		methods: {
			fromNow: timestamp => timestamp && moment(timestamp).fromNow()
		}
	}
</script>

<style>

</style>