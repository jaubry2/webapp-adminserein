output "app_instance_ips" {
  description = "IPs publiques des VMs applicatives"
  value       = module.compute.app_instance_ips
}
