<template>
	<span class="prompt">$</span> scriptabuild status --project "{{project.name}}"<br>
	<br>
	Latest build for {{project.branch}} ({{project.commitHash}}) was {{fromNow(project.timestamp)}}<br>
	Status: <span class="status {{project.buildStatusCss}}">{{project.buildStatus}}</span><br>
	<br>
	<button class="link" v-on:click="click">[Build now]</button><br>
	<a v-link="{name: 'build-logs', params: {projectName: project.name, buildId: ''}}">[View Log]</a><br>
</template>

<script>
	import Vue from "vue";
	import moment from "moment";
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
					let styles = {
						"never built": "unknown",
						ok: "ok",
						running: "running",
						unknown: "unknown",
						failed: "failed"
					};
					Vue.set(this.project, "buildStatusCss", styles[this.project.buildStatus]);
				});;
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