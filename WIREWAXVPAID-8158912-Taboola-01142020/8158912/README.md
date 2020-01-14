@@ -1,42 +0,0 @@
# WIREWAX Sample Offline Package

## Setup

### Host WIREWAX interactive video on custom domain / web server

Upload the entire package on hosting server. The url to WIREWAX interactive video will be the path to the `index.html` file inside the package.

###  Run WIREWAX interactive video without internet

For running the file on NodeJS, go to [THIS LINK](http://www.nodejs.org/), download for the required Operating System. Once it's installed:

1. Open Command Prompt or Terminal. 

2. Change directory to where the folder is, for example, if it was in the Downloads folder

   ```
   cd downloads
   ```

3. Change directory to the specific folder - Which'll be the name of offline package unzipped folder

   ```
   cd WIREWAXOffline-....
   ```

4. Now we're at the folder, run the local server with node

   ```
   node app.js
   
   # if it requires admin rights
   
   sudo node app.js
   ```

5. Go to your browser of choice and go to `localhost/index.html`,  You'll now see your video ready to play.

## Release

**2020-01-09**: Init offline package