# LARA Interactive API Sandbox #

This is the repository for a sandbox project, 
used to test LARA & Interactives communication.

You can run the sanbox on the [github pages site](http://concord-consortium.github.io/lara-interactive-api/).


## Developing: ##

* checkout the code from github
* `npm install` to install deps
* `gulp` will start watching source files in `./src` and will build
to the `./dev` directory
* edit  files in `./src`
* run `cd ./dev && live-server` to watch your changes in the browser

## Deploying: ##

### Dry run ###
* run `gulp build-all --production` this will create dist files in `./dist`
* run `cd ./dist && live-server` to check your work.
* Its possible you will see some very pedantic opinionated errors from coffee-lint.
* Either correct the coffeelint errors, or change the coffee-lint config in 
`.gulp/tasks/coffeelint-task.js`

### Update github pages ###
When satisfied with the state of `./dist` 
run `./build.sh` from the root directory of this project. This will attempt to
push changes up to the `gh-pages` branch of this project __which you shouldn't change by hand__

## TODO: ##
* Add RPC testing …
* Move LARA Api Documentation into this repo?

## LICENSE: ##

Available under the MIT [License](LICENSE).