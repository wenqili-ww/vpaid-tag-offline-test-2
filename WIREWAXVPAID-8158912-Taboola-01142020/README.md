# Taboola + WIREWAX VPAID Package

A standalone package for WWX interactive video working with VPAID.

## Usage
* **./8147925** - This folder contains an offline package for the sample video. I would highly suggest keeping the folder named as such and drop it into a folder on your server that will eventually hold all the offline packages. The directory you put this folder in will be referenced in the javascript file below.

* **taboola-wirewax-vpaid.js** - This is what will drive the VPAID tags. You will need to change the URLs on `lines 136` and `138` to wherever you wind up putting the offline packages, such as the one included. This file can be placed anywhere you would like.

* **taboola-vast-test.xml** - This is just a sample VAST tag file. You should change the URL on line 107 to reflect wherever you wind up putting the above javascript file.

