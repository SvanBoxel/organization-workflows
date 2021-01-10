terraform {
  # experiments = [provider_sensitive_attrs]
  required_version = ">= 0.14"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "2.41.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "organization-workflows-bot"
    storage_account_name = "orgworkflowbottfstate"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}

provider "azurerm" {
  skip_provider_registration = true
  features {
    key_vault {
      recover_soft_deleted_key_vaults = true
      purge_soft_delete_on_destroy    = true
    }
  }
}

data "azurerm_client_config" "current" {}
resource "azurerm_resource_group" "rg" {
  name     = "organization-workflows-bot"
  location = var.azure_region
}