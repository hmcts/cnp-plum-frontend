# ---- Base image ----
# BASE_IMAGE is the full image reference (either from ACR or local tag)
ARG BASE_IMAGE=hmctspublic.azurecr.io/base/node:20-alpine
FROM ${BASE_IMAGE} as base

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
