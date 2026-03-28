import { useState, useEffect, useRef } from "react";
import socket from "../serives/socket.api";
import logo from "./assets/logo.png";
export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState("");
  const [receiver, setReceiver] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState("");

  const chatContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageEndRef = useRef(null);

  const isNearBotton = () => {
    const el = chatContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 100;
  };

  const scrolltobottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const hasUnseenMessages = messages.some(
    (msg) => msg.sender === receiver && msg.status !== "seen",
  );

  useEffect(() => {
    if (isNearBotton() && hasUnseenMessages) {
      scrolltobottom();

      socket.emit("markAsSeen", {
        sender: receiver,
        receiver: user,
      });
    }
  }, [messages]);

  useEffect(() => {
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
      // console
      console.log(data);
    });
    socket.on("chatHistory", (message) => {
      setMessages(message);
    });
    // let typingTimeout;
    socket.on("userTyping", (data) => {
      //   console.log(data);
      setTyping(data.sender);
      setIsTyping(true);

      clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    });
    socket.on("messageSeen", ({ sender }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === user && msg.receiver === sender
            ? { ...msg, status: "seen" }
            : msg,
        ),
      );
    });

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
      console.log("Online Users:", users);
    });

    return () => {
      //   socket.off("receiveMessage");
      //   socket.off("getOnlineUsers");
      socket.off("receiveMessage");
      socket.off("getOnlineUsers");
      socket.off("messageSeen");
      socket.off("userTyping");
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
    socket.emit("markAsSeen", {
      sender: readermsg,
      receiver: user,
    });

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
    <div className="bg-gray-200  h-screen  w-full pt-2 px-2">
      {/* heading */}
      <div className="flex  items-center justify-between px-2 mb-2  rounded bg-white shadow-lg">
        {/* //Name of project */}
        <h2 className="font-bold text-2xl ">EchoChat</h2>
        <img src={logo} width={64} className="" alt="Echochat" />
      </div>

      {/* two containers  */}

      <div className="grid grid-cols-3 gap-4">
        {/* online users list  */}
        <div className="h-117 bg-white  rounded px-1 shadow-2xl">
          <h3 className="font-semibold px-1 mb-2">Messages</h3>
          <h3 className="border-b-1  px-1 text-[12px] text-orange-600 w-20 pb-2">
            All messages
          </h3>
          <ul className="  text-black  w-full">
            {onlineUsers.map((users, index) => (
              <li
                key={index}
                className={`py-2 px-1 flex  justify-between border-b-1 border-gray-500/50 ${users == user ? "hidden" : ""}`}
              >
                {users}{" "}
                <button
                  className="bg-amber-200 text-amber-900 hover:bg-green-600 hover:text-white transition-all ease-in px-4 py-0.5 rounded-2xl"
                  onClick={() => {
                    joinRoom(users);
                  }}
                >
                  {" "}
                  Chat{" "}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* message container and list  */}
        {/* //message list container */}
        <div
          className={`bg-gray-100 shadow-lg relative col-span-2 h-117 w-full pl-2 rounded no-scrollbar`}
        >
          <div
            ref={chatContainerRef}
            className="h-110 overflow-auto no-scrollbar"
          >
            {messages.map((item, index) => (
              //messages list
              <div
                className={`flex ${item.sender === user ? "flex-row-reverse" : "flex-row"} pb-5`}
                key={index}
              >
                <p className="bg-orange-100/50 m-1 max-w-60 p-2 flex flex-col rounded-3xl">
                  <strong className="text-[11px]">{item.sender}:</strong>
                  <span className="text-sm">{item.message}</span>

                  {item.sender === user && (
                    <span className="text-[10px] text-gray-500 mt-1">
                      {item.status === "sent" && "✔"}
                      {item.status === "delivered" && "✔✔"}
                      {item.status === "seen" && "✔✔ Seen"}
                    </span>
                  )}
                </p>
              </div>
            ))}
            <div ref={messageEndRef}></div>
          </div>

          {/* typing indicator and message input  */}
          <div>
            <div className="absolute bottom-12">
              {(isTyping && <h5 className="">: {typing} is typing...</h5>) || (
                <h5>:</h5>
              )}
            </div>
            <div className="flex justify-between w-full overflow-auto absolute bottom-2  pr-3 shadow-xl ">
              <input
                className=" bg-white w-full shadow-sm mr-2 px-2 rounded focus:outline-1 py-2"
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
      </div>
    </div>
  );
}
