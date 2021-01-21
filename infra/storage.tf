
resource "azurerm_storage_account" "bot-storage" {
  name                     = "orgworkflowsstorage"
  location                 = var.azure_region
  resource_group_name      = azurerm_resource_group.rg.name
  account_tier             = "Standard"
  account_replication_type = "LRS"
  allow_blob_public_access = true
  min_tls_version          = "TLS1_2"
}

resource "azurerm_storage_container" "bot-storage-container" {
  name                  = "stats"
  storage_account_name  = azurerm_storage_account.bot-storage.name
  container_access_type = "blob"
}
