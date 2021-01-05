resource "azurerm_cosmosdb_account" "bot-cosmos-db" {
  name                = "organization-workflows-bot"
  location            = var.azure_region
  resource_group_name = azurerm_resource_group.rg.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  consistency_policy {
    consistency_level       = "Session"
    max_interval_in_seconds = 5
    max_staleness_prefix    = 100
  }

  capabilities { 
    name = "EnableMongo"
  }

  capabilities { 
    name = "DisableRateLimitingResponses"
  }

  geo_location {
    location            = var.azure_region
    failover_priority = 0
  }

  tags = {
    hidden-cosmos-mmspecial = ""
  }
}