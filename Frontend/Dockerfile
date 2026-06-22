FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json .
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["/bin/sh", "-c", "[ -n \"$API_URL\" ] && sed -i \"s|/api|$API_URL|g\" /usr/share/nginx/html/config.js; nginx -g 'daemon off;'"]
