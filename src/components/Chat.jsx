import { useState, useEffect } from "react";
import socket from "../serives/socket.api";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket.on("recievemessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receiveMessage");
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
