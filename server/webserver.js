//Lets require/import the HTTP module
const fs = require('fs');
const https = require('https');
const exec = require('child_process').exec;

var privateKey = fs.readFileSync('/var/lib/node/drbd-motion.key').toString();
var certificate = fs.readFileSync('/var/lib/node/drbd-motion.crt').toString();

var primaryCmd = '/sbin/drbdadm primary nfs_data';
var secondaryCmd = '/sbin/drbdadm secondary nfs_data';
var initializeCmd = '/root/entrypoint.sh startfirstuse';
var resourceList = new Array();

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
    response.end('OK\r\n');
    console.log('Set server as primary');
  }
  else if(request.url == '/drbd-motion/secondary') 
  {
    exec(secondaryCmd, function(error, stdout, stderr) {
      console.log(error);
      console.log(stdout);
      console.log(stderr);
    });
    response.end('OK\r\n');
    console.log('Set server as secondary');
  }
  else if(request.url.indexOf('/drbd-motion/create-link') == 0) // resource_name/master_name/slave_name/master_ip/slave_ip/device_name/disk_name
  {
    var urlData = request.url.split("/");
    console.log("Parameter Count: " + urlData.length);
    if(urlData.length == 10)
    {
      var reqData = {ResourceName: urlData[3], MasterName: urlData[4], SlaveName: urlData[5], 
        MasterIP: urlData[6], SlaveIP: urlData[7], DeviceName: urlData[8], DiskName: urlData[9]};
      console.log(reqData);

      var fileData = "resource " + reqData.ResourceName + " {\r\n    on  " + reqData.MasterName + " {\r\n        device /dev/" + reqData.DeviceName + ";\r\n        disk /dev/" + reqData.DiskName + ";\r\n        address "+reqData.MasterIP+":7788;\r\n        meta-disk internal;\r\n    }\r\n";
      fileData += "on "+reqData.SlaveName+" {\r\n        device /dev/"+reqData.DeviceName+";\r\n        disk /dev/"+reqData.DiskName+";\r\n        address "+reqData.SlaveIP+":8877;\r\n        meta-disk internal;\r\n    }\r\n}\r\n";
      
      console.log(fileData);

      fs.writeFileSync('/etc/drbd.d/' + reqData.ResourceName + '.res', fileData);
      response.end('OK');
    }
    else
    {
      response.end('Invalid number of parameters.');
    }
  }
  else if(request.url == '/drbd-motion/initialize') 
  {
    exec(initializeCmd, function(error, stdout, stderr) {
      console.log(error);
      console.log(stdout);
      console.log(stderr);
    });
    response.end('OK\r\n');
    console.log('Initialization complete');
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
