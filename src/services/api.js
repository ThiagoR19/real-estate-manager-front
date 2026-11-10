import * as dashboardService from "./dashboard.js";
import * as loginService from "./login.js";
import * as propertyService from "./properties.js";

export { getSession, saveSession, clearSession, login, logout } from "./login.js";
export {
  assetUrl,
  propertyCatalogs,
  properties,
  property,
  propertyFiles,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyFiles,
  deletePropertyFile,
  downloadPropertyDocument,
} from "./properties.js";
export { http, apiBase } from "../utils/request.js";

export const api = {
  login: loginService.login,
  logout: loginService.logout,
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
  dashboard: dashboardService.getDashboard,
};
