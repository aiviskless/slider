import React from "react";

export const Video = ({ source }) => {
  return (
    <div className="Video">
      <h1>{source.title}</h1>
      <div className="Video__video-wrapper">
        <iframe
          src={source.link}
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="myFrame"
        ></iframe>
      </div>
    </div>
  );
};
