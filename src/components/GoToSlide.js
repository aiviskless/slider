import React from "react";

export const GoToSlide = ({ active, handleClick }) => {
  return (
    <div
      onClick={() => handleClick()}
      className={`GoToSlide ${active ? "GoToSlide--active" : ""}`}
    />
  );
};
