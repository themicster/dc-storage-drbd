# dc-storage-drbd
Data Center Storage using DRBD to migrate disks around your cluster

The idea is to use a physical disk, preferably a raid device as the persistant storage and allow compute nodes to mirror the physical disk in memory while using drbd to sync changes with the physical disk node.
This could be used for creating a small disk needed for a container that may move around your cluster. I created this so I could have only one or two of my CoreOS nodes with physical disks yet allow small disks to be mounted when it is needed with the container that needs it.
This is meant to run on an internal network, more work will need to be done to run this exposed to the internet.