# API: Mocked control measurements

ABB assignment - Mocked backend for mobile app *Feature Measurements Controls*


## Development dependencies installation

You can either run ```npm ci``` or ```yarn```to download project's dependencies.



## Release

Using ```yarn build``` a build will be produced at ```build/release```.

Using ```yarn start``` one of these builds is created, has the configuration sample file *.env.dist*
copied as ```build/release/.env``` (as to be used as this build real config), and then it's launched.



## Debug

In order for debugging to work ```yarn buildDebug``` must be run to produce a build with source maps 
at ```build/debug```. Then you should be able to e.g., run Debug in VSCode.

By running ```yarn debug```, aforementioned *buildDebug* script will be run, and a Node instance will
start afterwards (with source mapping registered), listening in default (configless) HTTP port 8080.



## Running operation

If everything goes good in the start-up process and listening for incoming connections, app will add
20 initial randomizations to the mocked dataset, and will end up showing a menu in which we can:

- Add 100 randomizations to the part features controls data
- Reinitialize data (as if app was booted again)
- Exit