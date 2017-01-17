FROM node:alpine
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN npm install && \
    npm cache clean
EXPOSE 80
RUN chmod +x /usr/src/app/docker-entrypoint.sh
ENTRYPOINT ["/usr/src/app/docker-entrypoint.sh", "npm", "start"]