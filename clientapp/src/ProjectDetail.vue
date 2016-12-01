<template>
	<span class="prompt">$</span> scriptabuild status --project "{{project.name}}"<br>
	<br> Latest activity for {{project.branch}} ({{project.commitHash}}) was {{fromNow(project.timestamp)}}<br> Build no. {{project.buildNo}}
	status: <span class="status {{project.buildStatusCss}}">{{project.buildStatus}}</span><br>
	<br>
	<button class="link" v-on:click="click">[Build now]</button><br>
	<a v-link="{name: 'build-logs', params: {projectName: project.name, buildId: ''}}">[View Log]</a><br>
</template>

<script>
	import Vue from "vue";
	import pubsub from "./pubsub";
	import moment from "moment";

	let styles = {
		"never built": "unknown",
		ok: "ok",
		running: "running",
		unknown: "unknown",
		failed: "failed"
	};


	export default {
		name: "project-detail",
		data: () => ({
			project: {
			}
		}),
		init() {
			fetch(`/api/project-detail/${this.$route.params.projectName}`)
				.then(resp => resp.json())
				.then(project => {
					this.project = project
					Vue.set(this.project, "buildStatusCss", styles[this.project.buildStatus]);
					Vue.set(this.project, "buildNo", this.project.buildNo);
				});
			pubsub.on("buildStatusChanged", data => {
				  console.log("*** data>", data);

				if(data.buildInfo.projectname == this.$route.params.projectName){
					Vue.set(this.project, "buildNo", data.buildInfo.buildNo);					
					Vue.set(this.project, "buildStatus", data.buildStatus);					
					Vue.set(this.project, "buildStatusCss", styles[data.buildStatus]);					
					Vue.set(this.project, "timestamp", moment());					
				}
			});
		},
		methods: {
			fromNow: timestamp => timestamp && moment(timestamp).fromNow(),
			click() {
				fetch(`/api/project-build/${this.$route.params.projectName}`, {
						method: "POST",
						mode: "cors"
					})
					.then(resp => {
						if (resp.status != 200) {
							throw {
								name: "Fetch Error",
								message: `Error posting to http//localhost:3000/project-build/${this.$route.params.projectName}`
							};
						}
						console.log("Started build...")
					})
			}
		}
	};
</script>

<style>

</style>