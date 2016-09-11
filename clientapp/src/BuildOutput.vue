<template>
	<span class="prompt">$</span> scriptabuild log --project "{{name}}"<br>
	<br>
	<ul class="log">
		<li v-for="line in log" class="{{line.level}}">
			{{{spacify(line.message)}}}
		</li>
	</ul>
</template>

<script>
	import Vue from "vue";
	export default {
		name: "build-output",
		data: () => ({
			log: [],
			name: ""
		}),
		init() {
			this.name = this.$route.params.projectName;
			fetch(`http://localhost:3000/project-log/${this.$route.params.projectName}`)
				.then(resp => resp.json())
				.then(log => {
					this.log = log;
					console.log(log);
				});;
		},
		methods:{
			spacify: message => message.replace(" ", "&nbsp;")
		}
	};
</script>

<style>

</style>