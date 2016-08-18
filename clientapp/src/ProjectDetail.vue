<template>
	<span class="prompt">$</span> scriptabuild status --project "{{project.name}}"<br>
	<br>
	Latest build for master branch was 6 minutes ago (Commit: 52b8775)<br>
	Status: <span class="{{project.status}}">{{project.status}}</span><br>
	<a v-link="{name: 'build-logs', params: {projectName: project.name, buildId: ''}}">[View Log]</a><br>
	<button class="link" v-on:click="click">[Build now]</button><br>
	<!--<br>
	[Switch branch]<br>
	[View earlier builds]<br>
	<ul>
		<li v-for="build in project.builds">
			<a v-link="{name: 'build-detail', params: {projectName: project.name, commitId: build.commitId}}">
			(Commit: {{build.commitId}}) [<span class="{{build.status}}">{{build.status}}</span>]
			</a>
		</li>
	</ul>-->
</template>

<script>
	export default {
		name: "project-detail",
		data: () => ({
			project: {
				name: undefined
			}
		}),
		methods: {
			click() {
				fetch(`http://localhost:3000/project-build/${this.$route.params.projectName}`, {
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
		},
		init() {
			fetch(`http://localhost:3000/project-detail/${this.$route.params.projectName}`)
				.then(resp => resp.json())
				.then(project => this.project = project);
		}
	};
</script>

<style>

</style>