FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

RUN mkdir -p /etc/nginx/ssl
COPY certs/ /etc/nginx/ssl/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

