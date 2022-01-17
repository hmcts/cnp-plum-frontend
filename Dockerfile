FROM hmctspublic.azurecr.io/base/node:16-alpine as base

# COPY package.json yarn.lock ./
RUN yarn install --production

FROM base as runtime
COPY . .
USER hmcts
