import React from "react";
import "./App.scss";
import { Slider } from "./Slider";
import { Text } from "./RandomContent/Text";
import { Video } from "./RandomContent/Video";

import image1 from "../assets/images/image1.jpg";
import image2 from "../assets/images/image2.jpg";
import { text1, text2, video1 } from "../config/contentSource";

export const App = () => {
  const slideData = [];

  // populate slides
  slideData.push(<Text text={text1} imgSrc={image2} />);
  slideData.push(<Text text={text2} />);
  slideData.push(<Video source={video1} />);
  slideData.push(<Text text={text2} imgSrc={image1} />);
  slideData.push(<Text text={text1} />);

  return <Slider slideData={slideData} />;
};
