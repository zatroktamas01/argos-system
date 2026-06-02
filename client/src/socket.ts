import { io } from "socket.io-client";

const user = JSON.parse(
  localStorage.getItem("argos_user") || "{}"
);

export const socket = io("http://localhost:5000", {
  auth: {
    user,
  },
});