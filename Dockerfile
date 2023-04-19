# ---- Base image ----
ARG PLATFORM=""
FROM hmctspublic.azurecr.io/base/node:18-alpine as base

USER root
RUN corepack enable
USER hmcts

COPY --chown=hmcts:hmcts . .

# ---- Runtime image ----
FROM base as runtime
COPY . .
USER hmcts
