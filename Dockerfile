# ---- Base image ----
ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:pr-18-alpine as base

USER root
RUN corepack enable
USER hmcts

COPY --chown=hmcts:hmcts . .

COPY ./.yarn/cache /opt/.yarn/cache
COPY ./.yarnrc.yml ./package.json ./yarn.lock ./

RUN yarn install

# ---- Build image ----
FROM base as build

RUN export YARN_VERSION=$(yarn --version)

RUN echo $YARN_VERSION

RUN yarn build:prod

RUN rm -rf webpack/ webpack.config.js

# ---- Runtime image ----
FROM base as runtime

COPY --from=build $WORKDIR/src/main ./src/main
# TODO: expose the right port for your application
EXPOSE 1337
