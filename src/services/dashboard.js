import { request } from "../utils/request.js";

export const getDashboard = () => request("/dashboard").then(({ data }) => data);