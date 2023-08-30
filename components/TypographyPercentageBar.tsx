import React from "react";

const TypographyPercentageBar = ({ value, positive = true, style }) => {
  const absValue = Math.abs(value);
  const width = absValue * 100 + "%";
  const valueNow = Math.round(value * 100);
  const text = `${valueNow > 0 ? "+" + Math.round(value * 100) + "%" : Math.round(value * 100) + "%"}`;

  const gradient = positive
    ? "from-green-500 via-green-400 to-green-300"
    : "from-red-500 via-red-400 to-red-300";

  const minWidth = "25px";
  const fontSize = width < minWidth ? "text-xs" : "text-base";

  return (
    <div className="w-100 h-35 relative">
      <div
        className={`text-white bg-gradient-to-r ${gradient} text-right ${width} ${minWidth} rounded-md p-2 ml-3  ${fontSize}`}
        style={style}
      >
        {text}
      </div>
    </div>
  );
};

export default TypographyPercentageBar;
