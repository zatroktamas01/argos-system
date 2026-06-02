import { io } from "socket.io-client";

const user = JSON.parse(
  localStorage.getItem("argos_user") || "{}"
);

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000";

export const socket = io(API_URL, {
  auth: {
    user,
  },
});