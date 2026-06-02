import { io } from "socket.io-client";

const user = JSON.parse(
  localStorage.getItem("argos_user") || "{}"
);

export const socket = io(
  process.env.REACT_APP_API_URL || "http://localhost:5000",
  {
    auth: {
      user,
    },
  }
);