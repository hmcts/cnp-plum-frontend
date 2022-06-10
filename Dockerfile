ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:16-alpine as base

COPY package.json yarn.lock ./
RUN yarn install --production --network-timeout 1000000

FROM base as runtime
COPY . .
USER hmcts