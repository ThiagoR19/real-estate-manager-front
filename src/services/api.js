import * as dashboardService from "./dashboard.js";
import * as agentService from "./agents.js";
import * as loginService from "./login.js";
import * as propertyService from "./properties.js";
import * as profileService from "./profile.js";
import * as professionalService from "./professionals.js";
import * as tenantService from "./tenants.js";

export const api = {
  agents: agentService.agents,
  createAgent: agentService.createAgent,
  updateAgent: agentService.updateAgent,
  deleteAgent: agentService.deleteAgent,
  updateAgentPhoto: agentService.updateAgentPhoto,
  getSession: loginService.getSession,
  saveSession: loginService.saveSession,
  clearSession: loginService.clearSession,
  login: loginService.login,
  logout: loginService.logout,
  assetUrl: propertyService.assetUrl,
  propertyCatalogs: propertyService.propertyCatalogs,
  properties: propertyService.properties,
  property: propertyService.property,
  propertyFiles: propertyService.propertyFiles,
  createProperty: propertyService.createProperty,
  updateProperty: propertyService.updateProperty,
  deleteProperty: propertyService.deleteProperty,
  uploadPropertyFiles: propertyService.uploadPropertyFiles,
  deletePropertyFile: propertyService.deletePropertyFile,
  downloadPropertyDocument: propertyService.downloadPropertyDocument,
  getProperty: propertyService.getProperty,
  profile: profileService.profile,
  updateProfile: profileService.updateProfile,
  updatePassword: profileService.updatePassword,
  updateProfilePhoto: profileService.updateProfilePhoto,
  tenants: tenantService.tenants,
  tenant: tenantService.tenant,
  tenantFiles: tenantService.tenantFiles,
  createTenant: tenantService.createTenant,
  updateTenant: tenantService.updateTenant,
  deleteTenant: tenantService.deleteTenant,
  uploadTenantFiles: tenantService.uploadTenantFiles,
  deleteTenantFile: tenantService.deleteTenantFile,
  downloadTenantDocument: tenantService.downloadTenantDocument,
  professionals: professionalService.professionals,
  createProfessional: professionalService.createProfessional,
  updateProfessional: professionalService.updateProfessional,
  deleteProfessional: professionalService.deleteProfessional,
  dashboard: dashboardService.getDashboard,
};
