FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . ./
RUN npm exec vite build -- --mode prod --base ./

FROM nginx:stable

COPY --from=build /app/dist /usr/share/nginx/html
