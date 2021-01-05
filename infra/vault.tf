resource "azurerm_key_vault" "bot-vault" {
  name                        = "org-workflows-bot-vault"
  location                    = var.azure_region
  resource_group_name         = azurerm_resource_group.rg.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_enabled         = true
  purge_protection_enabled    = false

  sku_name = "standard"

  network_acls {
    default_action = "Allow"
    bypass         = "AzureServices"
  }
}

resource "azurerm_key_vault_access_policy" "bot-vault-policy" {
  key_vault_id = azurerm_key_vault.bot-vault.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = data.azurerm_client_config.current.object_id

  key_permissions = [
    "Get",
  ]

  secret_permissions = [
    "Get",
  ]
}

data "azurerm_key_vault_secret" "bot-webhook-secret" {
  name         = "WEBHOOK-SECRET"
  key_vault_id = azurerm_key_vault.bot-vault.id
}

data "azurerm_key_vault_secret" "bot-app-id" {
  name         = "APP-ID"
  key_vault_id = azurerm_key_vault.bot-vault.id
}

data "azurerm_key_vault_secret" "bot-private-key" {
  name         = "PRIVATE-KEY"
  key_vault_id = azurerm_key_vault.bot-vault.id
}

data "azurerm_key_vault_secret" "bot-registry-username" {
  name         = "REGISTRY-SERVER-USERNAME"
  key_vault_id = azurerm_key_vault.bot-vault.id
}

data "azurerm_key_vault_secret" "bot-registry-password" {
  name         = "REGISTRY-SERVER-PASSWORD"
  key_vault_id = azurerm_key_vault.bot-vault.id
}