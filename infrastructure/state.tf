terraform {
  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "2.99.0"
    }
    random = {
      source = "hashicorp/random"
    }

    azuread = {
      source  = "hashicorp/azuread"
      version = "2.3.0"
    }
  }
}
