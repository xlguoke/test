FROM nginx:stable-alpine

LABEL cn.ilis.project="union"
LABEL cn.ilis.project.tier="web"

COPY /dist /usr/share/nginx/html
COPY .nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
