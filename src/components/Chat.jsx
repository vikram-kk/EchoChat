import { useState, useEffect, use } from "react";
import socket from "../serives/socket.api";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("");
  const [receiver, setReceiver] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState("");

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
      // console
      console.log(data);
    });
    socket.on("chatHistory", (message) => {
      setMessages(message);
    });

    socket.on("userTyping", (data) => {
      //   console.log(data);
      setTyping(data.sender);

      setIsTyping(true);

      setTimeout(() => {
        setIsTyping(false);
      }, 1800);
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

  const handleTyping = (e) => {
    setMessage(e.target.value);

    socket.emit("typing", {
      sender: user,
      receiver: receiver,
    });
  };

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
      <div className="bg-amber-600 h-screen w-full flex items-center justify-center">
        <form
          className="bg-amber-400 p-4 rounded shadow-2xl"
          onSubmit={(e) => submitHandler(e)}
        >
          <label className="font-bold text-xl" htmlFor="name">
            Enter your Name:
          </label>
          <input
            className="bg-gray-200 m-1 px-2 rounded-xl py-2"
            id="name"
            type="text"
            placeholder="eg. Vikram Thakur"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <button
            className="bg-amber-800 hover:bg-amber-700 px-4 py-2 rounded-2xl text-white"
            type="submit"
          >
            {" "}
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-amber-600 h-screen w-full flex items-center justify-center">
      <div className=" bg-amber-400 p-4 rounded shadow-2xl">
        <div className="flex flex-col items-center justify-center">
          <h2 className="font-bold text-2xl uppercase">
            Real Time Messaging App
          </h2>
          <h3 className="font-semibold">Online Users:</h3>
          <ul className="  text-amber-200  w-full">
            {onlineUsers.map((user, index) => (
              <li
                key={index}
                className="p-2 bg-amber-900 flex rounded justify-between m-1"
              >
                {user}{" "}
                <button
                  className="bg-amber-200 text-amber-900 hover:bg-green-600 hover:text-white transition-all ease-in px-4 py-0.5 rounded-2xl"
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
          <div
            className={`bg-amber-200 shadow-2xl overflow-auto h-70
                 w-full pl-2 rounded border-2 border-amber-100 no-scrollbar`}
          >
            {messages.map((item, index) => (
              <div
                className={`flex ${item.sender === user ? "flex-row-reverse" : "flex-row"}`}
                key={index}
              >
                <p className="bg-amber-50 m-1 max-w-30  p-2 flex flex-col rounded-3xl">
                  <strong className="text-[11px]">{item.sender}:</strong>
                  <span className="text-sm">{item.message}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
        {(isTyping && <p>: {typing} is typing...</p>) || <p>:</p>}
        <div className="flex justify-between">
          <input
            className=" bg-amber-100 w-full mr-2 px-2 rounded focus:outline-none py-0.5"
            type="text"
            placeholder="Type your message"
            value={message}
            onChange={(e) => handleTyping(e)}
          />
          <button
            className="bg-amber-100 px-4 rounded hover:bg-amber-900 hover:text-white transition-all ease-in"
            disabled={!user.trim()}
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
