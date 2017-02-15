<template>
	<span class="prompt">$</span> scriptabuild log --project "{{name}}"<br>
	<br>
	Log for build no: {{buildNo}}
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
			name: "",
			buildNo: ""
		}),
		init() {
			this.name = this.$route.params.projectName;
			fetch(`/api/project-log/${this.$route.params.projectName}`)
				.then(resp => resp.json())
				.then(result => {
					this.buildNo = result.buildNo;
					this.log = result.log;
					this.name= this.$route.params.projectName;
				});;
		},
		methods:{
			spacify: message => message.replace(" ", "&nbsp;"),
		}
	};
</script>

<style>

</style>