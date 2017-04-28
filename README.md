# drbd-motion
Data Center Storage using DRBD to migrate disks around your cluster. I'm using this only on an internal network, do not expose the drbd-motion server to the outside world! If you're running on a shared network at a could provider, beware.

You'll need to update the .env files with your internal IPs and use them in the curl commands below instead of the ones shown here.

Both Master and Slave:
```
sudo modprobe drbd
sudo modprobe brd rd_size=1024000
```

Initial Setup on master:
```
sudo mknod /dev/fake-dev0 b 7 200
sudo mkdir /opt
sudo dd if=/dev/zero of=/opt/dev0-backstore bs=1M count=1000

sudo losetup /dev/fake-dev0 /opt/dev0-backstore
sudo docker run --name drbd-motion -d --privileged --net=host --env-file=./server.env micster/drbd-motion-server
mkfs -t ext4 /dev/drbd0
```

Master (if you've already run this as part of the initial setup, it's still running no need to run it again):
```
sudo docker run --name drbd-motion -d --privileged --net=host --env-file=./server.env micster/drbd-motion-server
```

Slave:
```
sudo docker run --name drbd-motion -d --privileged --net=host --env-file=./client.env micster/drbd-motion-server
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
