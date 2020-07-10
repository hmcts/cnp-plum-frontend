FROM hmctspublic.azurecr.io/base/node:12-alpine as base

COPY package.json yarn.lock ./
RUN yarn install --production

FROM base as runtime
COPY . .
USER hmcts
