const key = "agi-registro-verificado";

export const setRegistrationDraft = (value) => sessionStorage.setItem(key, JSON.stringify(value));
export const getRegistrationDraft = () => {
  try { return JSON.parse(sessionStorage.getItem(key)); } catch { return null; }
};
export const clearRegistrationDraft = () => sessionStorage.removeItem(key);
