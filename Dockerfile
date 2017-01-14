FROM node:alpine
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
VOLUME /usr/src/app/client
RUN npm install
EXPOSE 80
CMD [ "npm", "start" ]