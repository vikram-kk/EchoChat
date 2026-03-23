import { useState, useEffect, use } from "react";
import socket from "../serives/socket.api";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
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

  const submitHandler = (e) => {
    e.preventDefault();
    socket.emit("addUser", user);
    setIsJoined(true);
    // socket.emit("addUser", "Diksha");
  };

  const sendMessage = () => {
    if (message.trim() === "") return;
    socket.emit("sendMessage", {
      user: user,
      message: message,
    });
    setMessage("");
  };
  if (!isJoined) {
    return (
      <div>
        <form onSubmit={(e) => submitHandler(e)}>
          <label htmlFor="name">Enter your Name:</label>
          <input
            type="text"
            placeholder="eg. Vikram Thakur"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <button type="submit" onClick={(e) => submitHandler(e)}>
            {" "}
            Join Chat
          </button>
        </form>
      </div>
    );
  }

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
      <button disabled={!user.trim()} onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}
