output "bot-webhook-secret-production" {
  value       = data.azurerm_key_vault_secret.bot-webhook-secret.value
  sensitive   = true
}

output "bot-webhook-secret-staging" {
  value       = data.azurerm_key_vault_secret.bot-webhook-secret-staging.value
  sensitive   = true
}

output "bot-app-id-production" {
  value       = data.azurerm_key_vault_secret.bot-app-id.value
  sensitive   = true
}

output "bot-app-id-staging" {
  value       = data.azurerm_key_vault_secret.bot-app-id-staging.value
  sensitive   = true
}

output "bot-private-key-production" {
  value       = data.azurerm_key_vault_secret.bot-private-key.value
  sensitive   = true
}

output "bot-private-key-staging" {
  value       = data.azurerm_key_vault_secret.bot-private-key-staging.value
  sensitive   = true
}

output "bot-registry-username" {
  value       = data.azurerm_key_vault_secret.bot-registry-username.value
  sensitive   = true
}

output "bot-registry-password" {
  value       = data.azurerm_key_vault_secret.bot-registry-password.value
  sensitive   = true
}