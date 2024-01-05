# ---- Base image ----
ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node${PLATFORM}:18-alpine as base

USER root
RUN corepack enable
USER hmcts

COPY --chown=hmcts:hmcts . .

COPY ./.yarnrc.yml ./package.json ./yarn.lock ./
RUN yarn install --immutable

# ---- Build image ----
FROM base as build

COPY --from=builder /.yarn/cache /opt/.yarn/cache
COPY --from=builder /.yarn/install-state.gz /opt/.yarn/
COPY --from=builder \
    /opt/.yarn/.pnp.cjs \
    /opt/.yarn/.pnp.loader.mjs \
    /opt/.yarn/.yarnrc.yml \
    /opt/.yarn/package.json \
    /opt/.yarn/yarn.lock \
    ./

RUN yarn build:prod && \
    rm -rf webpack/ webpack.config.js

# ---- Runtime image ----
FROM base as runtime

COPY --from=build $WORKDIR/src/main ./src/main
# TODO: expose the right port for your application
EXPOSE 1337
