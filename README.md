# drbd-motion
Data Center Storage using DRBD to migrate disks around your cluster

Both Master and Slave:
```
sudo modprobe drbd
sudo modprobe brd rd_size=1024000
```

Master:
```
sudo mknod /dev/fake-dev0 b 7 200
sudo mkdir /opt
sudo dd if=/dev/zero of=/opt/dev0-backstore bs=1M count=1000

sudo losetup /dev/fake-dev0 /opt/dev0-backstore
sudo docker run --name drbd --rm -it --privileged --net=host -e masternode=sea2-cn7 -e node0=sea2-cn7 -e node1=sea2-cn6 -e datadevice=/dev/drbd0 -e datadisk1=/dev/fake-dev0 -e nodeip0=10.1.2.7 -e nodeip1=10.1.2.6 -e drbdport=8877 geerd/drbd startfirstuse
sudo docker run --name drbd --rm -it --privileged --net=host -e masternode=sea2-cn7 -e node0=sea2-cn7 -e node1=sea2-cn6 -e datadevice=/dev/drbd0 -e datadisk1=/dev/ram0 -e nodeip0=10.1.2.7 -e nodeip1=10.1.2.6 -e drbdport=8877 --entrypoint=/bin/sh geerd/drbd -c "/root/configuredrbd.sh /etc/drbd.d/nfs_cluster.res && /sbin/drbdadm secondary nfs_data"
```

Slave:
```
sudo docker run --name drbd --rm -it --privileged --net=host -e masternode=sea2-cn7 -e node0=sea2-cn7 -e node1=sea2-cn6 -e datadevice=/dev/drbd0 -e datadisk1=/dev/ram0 -e nodeip0=10.1.2.7 -e nodeip1=10.1.2.6 -e drbdport=8877 geerd/drbd startfirstuse
sudo mkdir -p /var/data/drbd0
sudo docker run --name drbd --rm -it --privileged --net=host -e masternode=sea2-cn7 -e node0=sea2-cn7 -e node1=sea2-cn6 -e datadevice=/dev/drbd0 -e datadisk1=/dev/ram0 -e nodeip0=10.1.2.7 -e nodeip1=10.1.2.6 -e drbdport=8877 --entrypoint=/bin/sh geerd/drbd -c "/root/configuredrbd.sh /etc/drbd.d/nfs_cluster.res && /sbin/drbdadm primary nfs_data"

```

/dev/drbd0 doesn't show up inside the container, but that is fine. Also before drbdadm can be run, you'll have to run entrypoint.sh with one of the commands to get it to create the proper /etc/drbd.d/nfs_cluster.res
