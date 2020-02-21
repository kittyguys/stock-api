FROM node:12.14.1

WORKDIR /usr/src/stock

COPY package*.json ./

RUN npm install

COPY . .

# Comment in these lines below when you need to use "wait-for-it.sh"
# RUN apt-get update -qq && \
#   apt-get install -y mariadb-client vim

# CMD ["npm", "run", "dev:start"]

CMD ["npm", "run", "prod:start"]