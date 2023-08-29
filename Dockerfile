FROM node:14
RUN mkdir -p /app
COPY . /app
WORKDIR /app
RUN npm install
CMD ["npm","run","start"]
