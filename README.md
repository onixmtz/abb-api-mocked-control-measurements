# API: Mocked control measurements

ABB assignment - Mocked backend for mobile app *Feature Measurements Controls*


## Installation

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
