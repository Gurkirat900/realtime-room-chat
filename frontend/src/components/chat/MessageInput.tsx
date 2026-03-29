import { useState } from "react";

export default function MessageInput({
  onSend,
}: {
  onSend: (msg: string) => void;
}) {
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim()) return;
    onSend(value);
    setValue("");
  };

  return (
    <div className="p-3 border-t border-gray-700">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        placeholder="Type a message..."
        className="w-full p-2 rounded bg-gray-800 text-white"
      />
    </div>
  );
}
