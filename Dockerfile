# ---- Base image ----
ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:pr-18-alpine as base

USER root
RUN corepack enable
USER hmcts

COPY --chown=hmcts:hmcts . .

RUN yarn workspaces focus --all --production \
  && yarn cache clean

# ---- Build image ----
FROM base as build

RUN yarn workspaces focus --all --production \
  && yarn build:prod

# ---- Runtime image ----
FROM base as runtime

RUN rm -rf webpack/ webpack.config.js
COPY --from=build $WORKDIR/src/main ./src/main
# TODO: expose the right port for your application
EXPOSE 1337
