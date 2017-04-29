# drbd-motion
Data Center Storage using DRBD to migrate disks around your cluster. I'm using this only on an internal network, do not expose the drbd-motion server to the outside world! If you're running on a shared network at a could provider, beware.

You'll need to update the .env files with your internal IPs and use them in the curl commands below instead of the ones shown here.

This will create a 1GB file on the master and a 1GB ramdisk on the slave then it sets the slave to primary and you can mount it and read/write to it and all changes are saved in the file on the master. This is very basic at this point and not very useful yet. I plan to make it easier to use and make some scripts to do all the heavy lifting. At this point its a good proof of concept. I'm doing this on a set of CoreOS machines. Run the docker container from the directory with the .env files or update the --env-file= to point to them.

Clone this repository on the two servers and build the container in the server directory by running ./build

Both Master and Slave:
```
sudo modprobe drbd
sudo modprobe brd rd_size=1024000
```

Initial Setup on master (10.1.2.7):
```
sudo mknod /dev/fake-dev0 b 7 200
sudo mkdir /opt
sudo dd if=/dev/zero of=/opt/dev0-backstore bs=1M count=1000

sudo losetup /dev/fake-dev0 /opt/dev0-backstore
sudo docker run --name drbd-motion -d --privileged --net=host --env-file=./server.env micster/drbd-motion-server
curl -k https://10.1.2.7:8445/drbd-motion/initialize
sudo mkfs -t ext4 /dev/drbd0
```

Run docker logs drbd-motion to see the output from the server. You'll notice there is an error on formatting the filesystem, so that's why we do it manually after the initialize.

Master (if you've already run this as part of the initial setup, it's still running no need to run it again):
```
sudo docker run --name drbd-motion -d --privileged --net=host --env-file=./server.env micster/drbd-motion-server
```

Slave (10.1.2.6):
```
sudo docker run --name drbd-motion -d --privileged --net=host --env-file=./client.env micster/drbd-motion-server
curl -k https://10.1.2.6:8445/drbd-motion/initialize
```

Mount the disk on the slave:
```
curl -k https://10.1.2.7:8445/drbd-motion/secondary
curl -k https://10.1.2.6:8445/drbd-motion/primary

sudo mkdir -p /var/data/drbd0
sudo mount -t ext4 /dev/drbd0 /var/data/drbd0
```

Umount and set master as primary:
```
sudo umount /dev/drbd0

curl -k https://10.1.2.6:8445/drbd-motion/secondary
curl -k https://10.1.2.7:8445/drbd-motion/primary

```
