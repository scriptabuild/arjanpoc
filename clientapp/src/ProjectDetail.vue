<template>
	<span class="prompt">$</span> scriptabuild status --project "{{project.name}}"<br>
	<br>
	<div class="comment"># Details is not implemented yet</div>
	<div class="comment"># - link to history with statuses and commit ids (all builds for this project)</div>
	<div class="comment"># - check if there is a newer commit</div>
	<div class="comment"># - button to force a new build</div>
</template>

<script>
	export default {
		name: "project-detail",
		data() {
			return {
				project: {}
			}
		},
		init() {
			fetch(`http://localhost:3000/project-detail/${this.params.projectName}`)
				.then(resp => resp.json())
				.then(projects => this.projects = projects);
		}
	};
</script>

<style>
</style>