<template>
	<div id="app">
		<div>{{ msg }}</div>
	</div>
</template>

<script>
	import Vue from "Vue";

	export default {
		name: "app",
		data() {
			return {
				// note: changing this line won't causes changes
				// with hot-reload because the reloaded component
				// preserves its current state and we are modifying
				// its initial state.
				msg: '$ Scriptabuild'
			}
		}
	}
</script>

<style>
</style>