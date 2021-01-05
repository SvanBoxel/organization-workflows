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

  app_settings = {
    "APPINSIGHTS_INSTRUMENTATIONKEY"             = azurerm_application_insights.bot-insights.instrumentation_key
    "APPLICATIONINSIGHTS_CONNECTION_STRING"      = azurerm_application_insights.bot-insights.connection_string 
    "XDT_MicrosoftApplicationInsights_Mode"      = "default"
    "ApplicationInsightsAgent_EXTENSION_VERSION" = "~2"

    "DB_HOST"                                    = azurerm_cosmosdb_account.bot-cosmos-db.connection_strings[0]
    "DB_NAME"                                    = "production"

    "DOCKER_ENABLE_CI"                           = true
    "DOCKER_REGISTRY_SERVER_USERNAME"            = data.azurerm_key_vault_secret.bot-registry-username.value
    "DOCKER_REGISTRY_SERVER_PASSWORD"            = data.azurerm_key_vault_secret.bot-registry-password.value
    "DOCKER_REGISTRY_SERVER_URL"                 = "https://ghcr.io"

    "APP_ID"          = data.azurerm_key_vault_secret.bot-app-id.value
    "PRIVATE_KEY"     = data.azurerm_key_vault_secret.bot-private-key.value
    "WEBHOOK_SECRET"  = data.azurerm_key_vault_secret.bot-webhook-secret.value
  }

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

resource "azurerm_application_insights" "bot-insights" {
  name                = "organization-workflows-bot"
  location            = var.azure_region
  resource_group_name = azurerm_resource_group.rg.name
  application_type    = "web"
  sampling_percentage = 0
}