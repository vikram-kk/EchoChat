import { useState, useEffect } from "react";
import socket from "../serives/socket.api";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.emit("addUser", "Vikram");
    // socket.emit("addUser", "Diksha");

    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
      console.log("Online Users:", users);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("getOnlineUsers");
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() === "") return;
    socket.emit("sendMessage", {
      user: "Vikram",
      message: message,
    });
  };

  return (
    <div>
      <div>
        <h2>Real Time Messaging App</h2>
        <h3>Online Users:</h3>
        <ul>
          {onlineUsers.map((user, index) => (
            <li key={index}>{user}</li>
          ))}
        </ul>
        <div>
          {messages.map((item, index) => (
            <p key={index}>
              <strong>{item.user}:</strong>
              {item.message}
            </p>
          ))}
        </div>
      </div>
      <input
        type="text"
        placeholder="Type your message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
