import { Server } from "socket.io";
import EventEmitter from "events";

let io;
const eventBus = new EventEmitter();

export const initSocket = async (server) => {
    console.log("🔌 Initializing Socket.io...");

    const allowedOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(",").map(o => o.trim())
        : true;

    io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === "production" ? allowedOrigins : "*",
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("📡 Client connected to Socket.io");

        socket.on("disconnect", () => {
            console.log("📡 Client disconnected");
        });
    });

    // Emit updates to connected clients
    eventBus.on("bot_update", (data) => {
        io.emit("bot_update", data);
    });

    return io;
};

export const getIO = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};

export const emitUpdate = (event, data) => {
    if (io) io.emit(event, data);
};

export { eventBus };
