FROM node:18-alpine3.18

# Dependency
RUN apk add curl git
# Release CLI
RUN curl --location --output /usr/local/bin/release-cli "https://gitlab.com/api/v4/projects/gitlab-org%2Frelease-cli/packages/generic/release-cli/latest/release-cli-linux-amd64"
RUN chmod +x /usr/local/bin/release-cli

RUN npm install -g conventional-changelog-cli tsx semver
