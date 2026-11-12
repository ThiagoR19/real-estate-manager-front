import { request } from "../utils/request.js";

export const sendChatMessage = (idConversacion, contenido) =>
  request(`/chat/${idConversacion}/mensajes`, { method: "POST", body: { contenido } }).then(
    ({ data }) => data,
  );
