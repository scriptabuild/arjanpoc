import Vue from "vue";

let _instance = new Vue();
console.log("instance created")
export default {
	emit(type, payload){
		console.log(type, payload);
		_instance.$emit(type, payload);
	},
	on(type, fn){
		_instance.$on(type, fn);
	},	
};