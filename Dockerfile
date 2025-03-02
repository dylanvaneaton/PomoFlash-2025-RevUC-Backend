FROM node:current
WORKDIR /app

# We copy package first and install so a change to code doesn't rebuild dependencies.
COPY package*.json ./
RUN yarn install
COPY . .
EXPOSE 3001
CMD ["node", "app.js"]

