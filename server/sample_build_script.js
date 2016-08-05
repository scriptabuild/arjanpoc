
if(not_workspace_exists()){
	create_workspace_folder();
}

pull_project_from_git_into_workspace(projectUrl, commitId)

run_msbuild();
run_gulpbuild();
run_cs_tests();
run_js_tests();
run_octopack();
copy_octo_to_octoserver();
start_octo_deploy();