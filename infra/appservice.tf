module "vault" {
  source = "./modules/vault"
  azure_region = var.azure_region
  resource_group = azurerm_resource_group.rg.name
  tenant_id = data.azurerm_client_config.current.tenant_id
  object_id = data.azurerm_client_config.current.object_id
}

locals {
  shared_app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY"             = azurerm_application_insights.bot-insights.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING"      = azurerm_application_insights.bot-insights.connection_string 
    "XDT_MicrosoftApplicationInsights_Mode"      = "default"
    "ApplicationInsightsAgent_EXTENSION_VERSION" = "~2"

    "DB_HOST"                                    = azurerm_cosmosdb_account.bot-cosmos-db.connection_strings[0]

    "DOCKER_ENABLE_CI"                           = true
    "DOCKER_REGISTRY_SERVER_USERNAME"            = module.vault.bot-registry-username
    "DOCKER_REGISTRY_SERVER_PASSWORD"            = module.vault.bot-registry-password
    "DOCKER_REGISTRY_SERVER_URL"                 = "https://ghcr.io"
  }
}
resource "azurerm_app_service_plan" "bot-app-service-plan" {
  name                = "ASP-organizationworkflowsbot-b8c6"
  location            = var.azure_region
  resource_group_name = azurerm_resource_group.rg.name
  kind                = "linux"
  reserved            = true

  sku {
    tier = "Standard"
    size = "S1"
  }
}

resource "azurerm_app_service" "bot-app-service" {
  name                = "organization-workflows-bot"
  location            = var.azure_region
  resource_group_name = azurerm_resource_group.rg.name
  app_service_plan_id = azurerm_app_service_plan.bot-app-service-plan.id

  app_settings = merge(
    local.shared_app_settings, {
      "APP_ID"          = module.vault.bot-app-id-production
      "PRIVATE_KEY"     = module.vault.bot-private-key-production
      "WEBHOOK_SECRET"  = module.vault.bot-webhook-secret-production
      "DB_NAME"         = "production"

      "STATS_URI"       = "${azurerm_storage_account.bot-storage.primary_blob_endpoint}${azurerm_storage_container.bot-storage-container.name}/stats.json"
    }
  )

  site_config {
    always_on   = true
  }

  source_control {
    branch             = "main"
    manual_integration = true
    repo_url           = "https://github.com/SvanBoxel/organization-workflows"
    rollback_enabled   = false
  }
}

resource "azurerm_app_service_slot" "bot-app-service-staging-slot" {
  name                = "staging"
  app_service_name    = azurerm_app_service.bot-app-service.name
  location            = var.azure_region
  resource_group_name = azurerm_resource_group.rg.name
  app_service_plan_id = azurerm_app_service_plan.bot-app-service-plan.id

  app_settings = merge(
    local.shared_app_settings, {
      "APP_ID"          = module.vault.bot-app-id-staging
      "PRIVATE_KEY"     = module.vault.bot-private-key-staging
      "WEBHOOK_SECRET"  = module.vault.bot-webhook-secret-staging
      "DB_NAME"         = "staging"
    }
  )
}
resource "azurerm_application_insights" "bot-insights" {
  name                = "organization-workflows-bot"
  location            = var.azure_region
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
  sampling_percentage = 0
}