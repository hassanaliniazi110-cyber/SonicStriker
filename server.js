"use strict";
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");

const app = express();
const port = Number(process.env.PORT || 3000);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",").map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // No Origin is common for health checks and local scripts.
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin not allowed by ALLOWED_ORIGINS"));
  }
}));
app.use(express.json({ limit: "32kb" }));

const rooms = new Map();

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "SonicStriker", onlineRooms: rooms.size, mode: "starter-backend" });
});

app.get("/api/rooms", (_req, res) => {
  res.json({ rooms: [...rooms.values()].map(({ id, name, players }) => ({ id, name, players: players.length })) });
});

app.post("/api/rooms", (req, res) => {
  const name = typeof req.body?.name === "string" ? req.body.name.trim().slice(0, 32) : "";
  if (!name) return res.status(400).json({ ok: false, error: "Room name is required." });
  const room = { id: crypto.randomUUID(), name, players: [], createdAt: Date.now() };
  rooms.set(room.id, room);
  res.status(201).json({ ok: true, room: { id: room.id, name: room.name, players: 0 } });
});

app.post("/api/rooms/:id/join", (req, res) => {
  const room = rooms.get(req.params.id);
  if (!room) return res.status(404).json({ ok: false, error: "Room not found." });
  const playerName = typeof req.body?.playerName === "string" ? req.body.playerName.trim().slice(0, 24) : "";
  if (!playerName) return res.status(400).json({ ok: false, error: "Player name is required." });
  if (room.players.length >= 2) return res.status(409).json({ ok: false, error: "Room is full." });
  const player = { id: crypto.randomUUID(), name: playerName, joinedAt: Date.now() };
  room.players.push(player);
  res.status(201).json({ ok: true, player: { id: player.id, name: player.name }, players: room.players.length });
});

app.get("/", (_req, res) => res.json({ service: "SonicStriker API", health: "/health" }));
app.listen(port, () => console.log(`SonicStriker starter API listening on port ${port}`));
