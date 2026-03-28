import { getUserIdFromQuery } from "../utils.js";

const params = new URLSearchParams(window.location.search);
const showTitle = params.get("show");
const message = document.getElementById("confirmation-message");

message.textContent = `Your ticket for "${showTitle}" is confirmed.`;
