import { useState, useEffect, use } from "react";
import socket from "../serives/socket.api";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("");
  const [receiver, setReceiver] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
      // console
      console.log(data);
    });
    socket.on("chatHistory", (message) => {
      setMessages(message);
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
  const joinRoom = (readermsg) => {
    setReceiver(readermsg);

    socket.emit("joinRoom", { user1: user, user2: readermsg });

    // console
    // console
    console.log(`${user} requested to chat with ${readermsg}`);
  };

  const sendMessage = () => {
    if (message.trim() === "") return;
    socket.emit("sendMessage", {
      sender: user,
      receiver: receiver,
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
            id="name"
            type="text"
            placeholder="eg. Vikram Thakur"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <button type="submit"> Join Chat</button>
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
            <li key={index}>
              {user}{" "}
              <button
                onClick={() => {
                  joinRoom(user);
                }}
              >
                {" "}
                Chat{" "}
              </button>
            </li>
          ))}
        </ul>
        <div>
          {messages.map((item, index) => (
            <p key={index}>
              <strong>{item.sender}:</strong>
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
