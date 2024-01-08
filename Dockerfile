# ---- Base image ----
ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node:pr-18-alpine as base

USER root
RUN corepack enable
USER hmcts

COPY --chown=hmcts:hmcts . .

# ---- Build image ----
FROM base as build

RUN yarn build:prod && \
    rm -rf webpack/ webpack.config.js

# ---- Runtime image ----
FROM base as runtime

COPY --from=build $WORKDIR/src/main ./src/main
# TODO: expose the right port for your application
EXPOSE 1337
