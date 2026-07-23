# ---- Base image ----
ARG BASE_IMAGE=hmctssbox.azurecr.io/base/node:20-alpine
FROM ${BASE_IMAGE} AS base

USER root
RUN corepack enable
USER hmcts

COPY --chown=hmcts:hmcts package.json yarn.lock .yarnrc.yml tsconfig.json ./
COPY --chown=hmcts:hmcts .yarn ./.yarn
ENV YARN_NODE_LINKER=pnp
RUN PUPPETEER_SKIP_DOWNLOAD=true yarn install --immutable

# ---- Build image ----
FROM base AS build

COPY --chown=hmcts:hmcts webpack ./webpack
COPY --chown=hmcts:hmcts webpack.config.js ./
COPY --chown=hmcts:hmcts src/main ./src/main
COPY --chown=hmcts:hmcts config ./config

RUN yarn build:prod && \
    rm -rf webpack/ webpack.config.js

# ---- Runtime image ----
FROM base AS runtime

COPY --from=build $WORKDIR/src/main ./src/main
COPY --from=build $WORKDIR/config ./config
# TODO: expose the right port for your application
EXPOSE 1337
