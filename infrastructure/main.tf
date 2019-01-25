provider "azurerm" {
  version = "1.19.0"
}

locals {
  aseName = "${data.terraform_remote_state.core_apps_compute.ase_name[0]}"

  local_env = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "aat" : "saat" : var.env}"
  local_ase = "${(var.env == "preview" || var.env == "spreview") ? (var.env == "preview" ) ? "core-compute-aat" : "core-compute-saat" : local.aseName}"

  backend_product_name = "${var.product}"

  recipe_backend_url = "http://${local.backend_product_name}-recipe-backend-${local.local_env}.service.${local.local_ase}.internal"
}

module "frontend" {
  source               = "git@github.com:hmcts/moj-module-webapp?ref=cnp-1094-dt"
  product              = "${var.product}-frontend"
  location             = "${var.location}"
  env                  = "${var.env}"
  ilbIp                = "${var.ilbIp}"
  is_frontend          = true
  subscription         = "${var.subscription}"
  additional_host_name = "${var.product}.platform.hmcts.net"
  common_tags          = "${var.common_tags}"

  asp_name = "${var.product}"

  app_settings                         = {
    # REDIS_HOST                       = "${module.redis-cache.host_name}"
    # REDIS_PORT                       = "${module.redis-cache.redis_port}"
    # REDIS_PASSWORD                   = "${module.redis-cache.access_key}"
    RECIPE_BACKEND_URL                 = "${local.recipe_backend_url}"
    WEBSITE_NODE_DEFAULT_VERSION       = "8.8.0"
    WEBSITE_PROACTIVE_AUTOHEAL_ENABLED = "${var.autoheal}"
  }
}
