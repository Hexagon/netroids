# netroids

Demo
========

Current version always available at http://netroids.56k.guru


Docker setup
========

Clone this repo, enter the new directory.

Build image
```bash
docker build . --tag="hexagon/netroids"
```

Run container, enable start on boot, expose to port 80 at host
```bash
sudo docker run -d --restart=always -p 80:6660 hexagon/netroids
```

Browse to ```http://<ip-of-server>/```

Done!


Development
========

Clone repo

Run with ```npm start```, access at ```http://localhost:6660```
