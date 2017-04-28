//Lets require/import the HTTP module
const fs = require('fs');
const https = require('https');
const exec = require('child_process').exec;

var privateKey = fs.readFileSync('/var/lib/node/drbd-motion.key').toString();
var certificate = fs.readFileSync('/var/lib/node/drbd-motion.crt').toString();

var primaryCmd = '/sbin/drbdadm primary nfs_data';
var secondaryCmd = '/sbin/drbdadm secondary nfs_data';

const options = {
  key: privateKey,
  cert: certificate
};

//Lets define a port we want to listen to
const PORT=8445;

//We need a function which handles requests and send response
function handleRequest(request, response){
  var now = new Date();

  console.log(now.toString() + ': Request for: ' + request.url + ', From: ' + request.connection.remoteAddress);

  // TODO: Make this secure by requiring a token
  if(request.url == '/drbd-motion/primary') 
  {
    exec(primaryCmd, function(error, stdout, stderr) {
      console.log(error);
      console.log(stdout);
      console.log(stderr);
    });
    response.end('OK');
    console.log('Set server as primary');
  }
  else if(request.url == '/drbd-motion/secondary') 
  {
    exec(secondaryCmd, function(error, stdout, stderr) {
      console.log(error);
      console.log(stdout);
      console.log(stderr);
    });
    response.end('OK');
    console.log('Set server as secondary');
  }
  else {
    response.end('Unknown request Path: ' + request.url + ', From: ' + request.connection.remoteAddress);
  }
}


var initCmd = '/root/configuredrbd.sh /etc/drbd.d/nfs_cluster.res';

exec(initCmd, function(error, stdout, stderr) {
  console.log(stdout);
});

//Create a server
var server = https.createServer(options, handleRequest);

//Lets start our server
server.listen(PORT, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on port: %s", PORT);
});
