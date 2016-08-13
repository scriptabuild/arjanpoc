<template>
	<span class="prompt">$</span> scriptabuild status --list<br>
	<br>
	<ul>
		<li v-for="project in projects">
			<a v-link="{name: 'project-detail', params: { projectName: project.name}}">
			{{project.name}} <span class="{{project.status}}">{{project.status}}</span>
			</a>
		</li>
	</ul>
</template>

<script>
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
				.then(projects => this.projects = projects);
		}
	};
</script>

<style>
</style>