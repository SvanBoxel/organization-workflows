provider "azurerm" {
  version = "=2.41.0"

  features {}
}

data "azurerm_client_config" "current" {}
terraform {
  backend "azurerm" {
    resource_group_name  = "organization-workflows-bot"
    storage_account_name = "orgworkflowbottfstate"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}

resource "azurerm_resource_group" "rg" {
  name     = "organization-workflows-bot"
  location = var.azure_region
}