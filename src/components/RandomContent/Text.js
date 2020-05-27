import React from "react";

export const Text = ({ text, imgSrc = false }) => {
  return (
    <div className="Text">
      {imgSrc ? <img src={imgSrc} alt="Scandiweb" /> : ""}
      <p>
        <q>{text}</q>
      </p>
    </div>
  );
};
