import { request } from "../utils/request.js";

export const obtenerDashboard = () => request("/dashboard").then(({ data }) => data);
