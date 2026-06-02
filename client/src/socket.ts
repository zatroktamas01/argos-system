import { io } from "socket.io-client";

const user = JSON.parse(
  localStorage.getItem("argos_user") || "{}"
);

const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://argos-backend-r1nu.onrender.com";

export const socket = io(API_URL, {
  auth: {
    user,
  },
});