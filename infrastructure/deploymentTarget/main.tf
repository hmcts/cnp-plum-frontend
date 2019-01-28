locals {
  local_env = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
  recipe_backend_url  = "http://${var.product}-recipe-backend-${local.local_env}${var.deployment_target}.service.${var.env}.platform.hmcts.net"
  shared_rg = "${var.product}-shared-infrastructure-${var.env}"
}


data "azurerm_key_vault" "key_vault" {
  name                = "${var.product}si-${var.env}"
  resource_group_name = "${local.shared_rg}"
}

data "azurerm_key_vault_secret" "appInsights-InstrumentationKey" {
  name      = "appInsights-InstrumentationKey"
  vault_uri = "${data.azurerm_key_vault.key_vault.vault_uri}"
}


module "frontend" {
  source               = "git@github.com:hmcts/cnp-module-webapp?ref=master"
  product              = "${var.product}-frontend"
  location             = "${var.location}"
  env                  = "${var.env}"
  deployment_target    = "${var.deployment_target}"
  ilbIp                = "${var.ilbIp}"
  is_frontend          = true
  subscription         = "${var.subscription}"
  additional_host_name = "${var.product}.platform.hmcts.net"
  common_tags          = "${var.common_tags}"
  shared_infra         = true
  instance_size        = "I1"

  appinsights_instrumentation_key = "${data.azurerm_key_vault_secret.appInsights-InstrumentationKey.value}"

  asp_name     = "${var.product}-${var.env}${var.deployment_target}"
  asp_rg       = "${local.shared_rg}${var.deployment_target}"


  app_settings                         = {
    # REDIS_HOST                       = "${module.redis-cache.host_name}"
    # REDIS_PORT                       = "${module.redis-cache.redis_port}"
    # REDIS_PASSWORD                   = "${module.redis-cache.access_key}"
    RECIPE_BACKEND_URL                 = "${local.recipe_backend_url}"
    WEBSITE_NODE_DEFAULT_VERSION       = "8.8.0"
    WEBSITE_PROACTIVE_AUTOHEAL_ENABLED = "${var.autoheal}"
  }
}
