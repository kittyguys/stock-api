FROM node:12.14.1

WORKDIR /usr/src/stock

COPY package*.json ./

RUN npm install

COPY . .

RUN apt-get update -qq && \
  apt-get install -y mariadb-client vim

CMD ["npm" ,"start"]
