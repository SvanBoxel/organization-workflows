FROM node:12-slim
WORKDIR /usr/src/app
COPY package.json package-lock.json tsconfig.json ./
COPY src src
RUN npm ci
RUN npm run build
RUN npm cache clean --force
ENV NODE_ENV="production"
ENV PORT=8080
EXPOSE 8080
COPY lib lib
CMD [ "npm", "start" ]
