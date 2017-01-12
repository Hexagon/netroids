# netroids

Demo
========

Current version always available at http://netroids.56k.guru

Docker setup
========

To run latest netroids with docker, exposed on host port 80, simply run the following command to pull it from docker hub

```bash
sudo docker run -d --restart=always -p 80:80 hexagon/netroids
```


Docker setup (manual)
========

Clone this repo, enter the new directory.

Build image
```bash
docker build . --tag="hexagon/netroids"
```

Run container, enable start on boot, expose to port 80 at host
```bash
sudo docker run -d --restart=always -p 80:80 hexagon/netroids
```

Browse to ```http://<ip-of-server>/```

Done!


Development
========

Clone repo, enter directory

Run with ```npm start```, access at ```http://localhost:80```

To change port, set environment variable PORT to the desired number like below

Linux:

```PORT=6660 npm start```

Windows:

```set PORT=660 && npm start```