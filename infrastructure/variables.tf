variable "product" {
  type        = "string"
  default     = "plum"
  description = "The name of your application"
}

variable "location" {
  type    = "string"
  default = "UK South"
}

variable "env" {
  type        = "string"
  description = "(Required) The environment in which to deploy the application infrastructure."
}

variable "ilbIp" {}

variable "subscription" {}
variable "common_tags" {
  type = "map"
}

variable "autoheal" {
  description = "Enabling Proactive Auto Heal for Webbapps"
  type        = "string"
  default     = "True"
}
