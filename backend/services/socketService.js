// Lightweight socket service wrapper. The actual Socket.IO server instance will be set at startup.

let io = null;

export const socketService = {
  async attach(server) {
    try {
      // lazy import to avoid dependency if not used
      const mod = await awaitImport('socket.io');
      const Server = mod.Server || mod.default?.Server || mod.default || mod;
      io = new Server(server, {
        cors: {
          origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
          credentials: true
        }
      });

      io.on('connection', (socket) => {
        console.log('Socket connected:', socket.id);
        // Expect client to emit `identify` with userId to map socket to user
        socket.on('identify', (userId) => {
          socket.join(`user:${userId}`);
          console.log(`Socket ${socket.id} joined room user:${userId}`);
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected:', socket.id);
        });
      });

    } catch (err) {
      console.error('Failed to attach Socket.IO:', err?.message || err);
    }
  },

  emitToUser(userId, event, payload) {
    if (!io) throw new Error('Socket.IO not initialized');
    io.to(`user:${userId}`).emit(event, payload);
  }
};

// helper for dynamic import in CommonJS/ESM mixed environments
function awaitImport(name) {
  return new Promise((resolve, reject) => {
    try {
      resolve(require(name));
    } catch (e) {
      // try dynamic import
      import(name).then(mod => resolve(mod)).catch(reject);
    }
  });
}
