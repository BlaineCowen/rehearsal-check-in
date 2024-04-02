import { useState } from "react";

function NameBox({ id, name, onSelect }: any) {
  const [isSelected, setIsSelected] = useState(false);

  const toggleSelect = () => {
    setIsSelected(!isSelected);
    if (typeof onSelect === "function") {
      onSelect(id);
    } else {
      console.log("onSelect is not a function");
    }
  };

  return (
    <div
      onClick={toggleSelect}
      className={`p-4 border rounded border-white cursor-pointer ${
        isSelected
          ? "bg-green-500 hover:bg-green-400"
          : "bg-black hover:bg-green-400"
      }`}
    >
      {name}
    </div>
  );
}

export default NameBox;
