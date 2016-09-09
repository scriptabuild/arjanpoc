<template>
<span class="prompt">$</span> scriptabuild status --list<br>
	<br>
	<ul>
		<li v-for="project in projects">
			<a v-link="{name: 'project-detail', params: { projectName: project.name}}">
				{{project.name}} <span class="status {{project.buildStatusCss}}">{{project.buildStatus}}</span>
			</a>
		</li>
	</ul>
</template>

<script>
	import Vue from "vue"
	import _ from "lodash";
	export default {
		name: "project-list",
		data() {
			return {
				projects: []
			}
		},
		init() {
			fetch("http://localhost:3000/project-list")
				.then(resp => resp.json())
				.then(projects => this.projects = projects)
				.then(() => {
					let styles = {"never built": "unknown", ok:"ok", progress: "progress", unknown: "unknown", failed: "failed"};
					for(var k in this.projects){
						Vue.set(this.projects[k], "buildStatusCss", styles[this.projects[k].buildStatus]);
					}
				});
		}
	}
</script>

<style>

</style>