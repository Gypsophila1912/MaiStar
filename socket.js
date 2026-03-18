const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: "*" } });
const API = "http://localhost:3001";

async function callAPI(path, data) {
  const res = await fetch(API + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  console.log("APIレスポンス:", path, text);
  return JSON.parse(text);
}

// ホストが抜けた場合に部屋を閉じる共通関数
async function handleLeave(socket, isDisconnect = false) {
  try {
    // 部屋IDとホスト判定を取得
    const roomResult = await callAPI("/api/room/get-by-socket", {
      socketId: socket.id,
    });
    const roomId = roomResult && !roomResult.error ? roomResult.roomId : null;
    const hostResult = await callAPI("/api/room/is-host", {
      socketId: socket.id,
    });

    if (hostResult.isHost && roomId) {
      // ホストが抜けた → 部屋を閉じて全員に通知
      io.to(roomId).emit("部屋解散", {
        message: "ホストが退室したため部屋が解散されました",
      });
      await callAPI("/api/room/delete", { roomId: roomId });
      console.log("部屋解散:", roomId);
    } else if (isDisconnect) {
      // 切断時 → socketIdをnullにして10秒後に削除
      await callAPI("/api/room/leave", { socketId: socket.id });
      setTimeout(async () => {
        await callAPI("/api/room/remove", { socketId: socket.id });
        if (roomId) {
          const updated = await callAPI("/api/room/get", { roomId: roomId });
          if (updated && !updated.error) {
            io.to(roomId).emit("待機室更新", updated);
          }
        }
        console.log("プレイヤー削除:", socket.id);
      }, 10000);
    } else {
      // 退室ボタン → 即座に削除
      await callAPI("/api/room/remove", { socketId: socket.id });
      if (roomId) {
        const updated = await callAPI("/api/room/get", { roomId: roomId });
        if (updated && !updated.error) {
          io.to(roomId).emit("待機室更新", updated);
        }
      }
      console.log("退室:", socket.id);
    }
  } catch (e) {
    console.error("退室処理エラー:", e.message);
  }
}

io.on("connection", (socket) => {
  console.log("接続:", socket.id);

  socket.on("部屋作成", async (data) => {
    try {
      const result = await callAPI("/api/room/create", {
        ...data,
        socketId: socket.id,
      });
      if (result.error) {
        socket.emit("エラー", result);
        return;
      }
      socket.join(result.roomId);
      socket.emit("部屋作成完了", result);
    } catch (e) {
      console.error("部屋作成エラー:", e.message);
      socket.emit("エラー", { message: "サーバーエラーが発生しました" });
    }
  });

  socket.on("入室", async (data) => {
    console.log("入室リクエスト:", data);
    try {
      const result = await callAPI("/api/room/join", {
        ...data,
        socketId: socket.id,
      });
      if (result.error) {
        socket.emit("エラー", result);
        return;
      }
      socket.join(result.roomId);
      socket.emit("入室完了", result);
      console.log("待機室更新送信先:", result.roomId); // ← 追加
      io.to(result.roomId).emit("待機室更新", result);
    } catch (e) {
      console.error("入室エラー:", e.message);
      socket.emit("エラー", { message: "サーバーエラーが発生しました" });
    }
  });

  socket.on("ゲーム開始", async (data) => {
    try {
      const result = await callAPI("/api/game/start", {
        ...data,
        socketId: socket.id,
      });
      if (result.error) {
        socket.emit("エラー", result);
        return;
      }

      // 各プレイヤーに個別のstateを送信
      result.states.forEach(({ socketId, state }) => {
        const stateObj = typeof state === "string" ? JSON.parse(state) : state;
        io.to(socketId).emit("ゲーム開始", stateObj);
      });
    } catch (e) {
      console.error("ゲーム開始エラー:", e.message);
      socket.emit("エラー", { message: "サーバーエラーが発生しました" });
    }
  });

  socket.on("再接続", async (data) => {
    try {
      const result = await callAPI("/api/room/rejoin", {
        ...data,
        socketId: socket.id,
      });
      if (result.error) {
        // 部屋が見つからない場合はホームに戻す
        socket.emit("再接続失敗", {});
        return;
      }
      socket.join(result.roomId);
      socket.emit("再接続完了", result);
    } catch (e) {
      socket.emit("再接続失敗", {});
    }
  });

  socket.on("退室", async () => {
    await handleLeave(socket, false);
  });

  socket.on("disconnect", async () => {
    console.log("切断:", socket.id);
    await handleLeave(socket, true);
  });
});

const PORT = process.env.WS_PORT || 5001;
httpServer.listen(PORT, () => {
  console.log("Socket.ioサーバー起動:", PORT);
});
