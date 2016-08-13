<template>
	<span class="prompt">$</span> scriptabuild status --project "{{project.name}}"<br>
	<br>
	Status [<span class="{{project.status}}">{{project.status}}</span>]<br>
	<br>
	Latest builds:<br>
	<ul>
		<li v-for="build in project.builds">
			<a v-link="{name: '', params: ''}">
			(Commit: {{build.commitId}}) [<span class="{{build.status}}">{{build.status}}</span>]
			</a>
		</li>
	</ul>
</template>

<script>
	export default {
		name: "project-detail",
		data: () => ({
			project: {
				name: undefined
			}
		}),
		init() {
			fetch(`http://localhost:3000/project-detail/${this.$route.params.projectName}`)
				.then(resp => resp.json())
				.then(project => this.project = project);
		}
	};
</script>

<style>

</style>