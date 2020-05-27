import React, {
  useRef,
  useEffect,
  useReducer,
  useCallback,
  useState,
} from "react";
import { Slide } from "./Slide";
import { GoToSlide } from "./GoToSlide";

const initialState = {
  bufferCount: 1,
  windowWidth: 0,
  translateX: 0,
  // chosen slider
  slideNr: 1,
  slideWidth: 0,
  sliderStyleModifier: "",
  // mouse / finger X position on screen
  clientX: 0,
  // first mouse / finger X position on screen
  clientXStart: 0,
  slideCount: 0,
  // pixels that need to be moved to shift to a new slide
  threshold: 0,
};

const reducer = (state, action) => {
  const centerSlide = (slideNr, slideWidth, windowWidth) => {
    return -(slideNr * slideWidth - windowWidth / 2 + slideWidth / 2);
  };

  const shiftSlide = (newSlideNr) => {
    return {
      ...state,
      slideNr: newSlideNr,
      sliderStyleModifier: "Slider__slides--transition",
      translateX: centerSlide(newSlideNr, state.slideWidth, state.windowWidth),
    };
  };

  switch (action.type) {
    case "set-slider-width":
      return {
        ...state,
        slideWidth: action.payload.slideWidth,
        threshold: action.payload.windowWidth / 10,
        windowWidth: action.payload.windowWidth,
        bufferCount: action.payload.bufferCount,
        slideNr: action.payload.bufferCount,
        translateX: centerSlide(
          state.slideNr,
          action.payload.slideWidth,
          action.payload.windowWidth
        ),
      };
    case "set-slider-count":
      return {
        ...state,
        slideCount: action.payload,
      };
    case "update-slide-nr":
      return {
        ...state,
        slideNr: action.payload,
        sliderStyleModifier: "",
        translateX: centerSlide(
          action.payload,
          state.slideWidth,
          state.windowWidth
        ),
      };
    case "shift-slide":
      return shiftSlide(action.payload);
    case "drag-start":
      return {
        ...state,
        clientXStart: action.payload,
        clientX: action.payload,
        sliderStyleModifier: "",
      };
    case "drag-action":
      return {
        ...state,
        clientX: action.payload,
        translateX:
          centerSlide(state.slideNr, state.slideWidth, state.windowWidth) -
          state.clientXStart +
          action.payload,
      };
    case "drag-end":
      if (state.clientX - state.clientXStart > state.threshold) {
        // go left
        return shiftSlide(state.slideNr - 1);
      } else if (state.clientXStart - state.clientX > state.threshold) {
        // go right
        return shiftSlide(state.slideNr + 1);
      } else {
        // stay
        return shiftSlide(state.slideNr);
      }
    default:
      return state;
  }
};

export const Slider = ({ slideData }) => {
  const [
    {
      sliderStyleModifier,
      translateX,
      slideNr,
      slideCount,
      slideWidth,
      bufferCount,
    },
    dispatch,
  ] = useReducer(reducer, initialState);
  const [sliderContents, setSliderContents] = useState(slideData);
  const sliderRef = useRef(null);

  // DRAG EVENTS //
  const dragAction = useCallback((e) => {
    let clientX;

    if (e.type === "touchmove") {
      // handle touch on mobile devices
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }

    dispatch({
      type: "drag-action",
      payload: clientX,
    });
  }, []);

  const dragEnd = useCallback(() => {
    dispatch({ type: "drag-end" });

    sliderRef.current.onmouseup = null;
    sliderRef.current.onmousemove = null;
    sliderRef.current.addEventListener("touchmove", null);
    sliderRef.current.addEventListener("touchend", null);
  }, []);

  const dragStart = useCallback(
    (e) => {
      e = e || window.event;
      e.preventDefault();
      let clientX;

      if (e.type === "touchstart") {
        // handle touch on mobile devices
        sliderRef.current.addEventListener("touchmove", dragAction);
        sliderRef.current.addEventListener("touchend", dragEnd);

        clientX = e.touches[0].clientX;
      } else {
        sliderRef.current.onmousemove = dragAction;
        sliderRef.current.onmouseup = dragEnd;

        clientX = e.clientX;
      }

      dispatch({ type: "drag-start", payload: clientX });
    },
    [dragAction, dragEnd]
  );
  // DRAG EVENTS END //

  // handle go to X slide
  const handleClickOnGoToSlide = (index) => {
    dispatch({ type: "shift-slide", payload: index });
  };

  // add items before first and after last slide on mount
  useEffect(() => {
    const newSlideData = [...slideData];

    for (let i = 0; i < bufferCount; i++) {
      newSlideData.push(slideData[i]);
      newSlideData.unshift(newSlideData[slideData.length - 1]);
    }

    dispatch({ type: "set-slider-count", payload: newSlideData.length });
    setSliderContents(newSlideData);
  }, [slideData, bufferCount, slideNr]);

  // add events
  useEffect(() => {
    const ref = sliderRef.current;

    ref.onmousedown = dragStart;
    // add event for mobile devices
    ref.addEventListener("touchstart", dragStart);

    return () => {
      // cleanup
      ref.onmousedown = null;
      ref.addEventListener("touchstart", null);
    };
  }, [dragStart, dragAction, dragEnd]);

  // check slider index to support infinity
  useEffect(() => {
    const updateSlideNr = (newSlideNr) => {
      setTimeout(() => {
        dispatch({
          type: "update-slide-nr",
          payload: newSlideNr,
        });
      }, 250);
    };

    if (slideNr + bufferCount === slideCount) {
      // go to first slide
      updateSlideNr(bufferCount);
    } else if (slideNr === bufferCount - 1) {
      // go to last slide
      updateSlideNr(slideCount - bufferCount * 2 + bufferCount - 1);
    }
  }, [slideNr, slideCount, bufferCount]);

  // listen for window resize, update slider width and slider threshold
  useEffect(() => {
    const getSlideWidth = () => {
      if (window.innerWidth < 1025)
        return {
          windowWidth: window.innerWidth,
          slideWidth: window.innerWidth,
          bufferCount: 1,
        };
      if (window.innerWidth < 1367)
        return {
          windowWidth: window.innerWidth,
          slideWidth: 450,
          bufferCount: 3,
        };
      return {
        windowWidth: window.innerWidth,
        slideWidth: 650,
        bufferCount: 3,
      };
    };

    const setSliderWidth = () => {
      dispatch({
        type: "set-slider-width",
        payload: getSlideWidth(),
      });
    };

    const handleWindowResize = () => {
      setTimeout(() => setSliderWidth(), 500);
    };

    // set parameters on mount
    setSliderWidth();

    window.addEventListener("resize", handleWindowResize);
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [bufferCount]);

  return (
    <div className="Slider">
      {/* Slides */}
      <div
        ref={sliderRef}
        className={"Slider__slides " + sliderStyleModifier}
        style={{
          transform: `translateX(${translateX}px)`,
          width: slideCount * slideWidth,
        }}
      >
        {sliderContents.map((slide, i) => (
          <div
            key={i}
            style={{ width: slideWidth }}
            className={`Slider__slide-wrapper ${
              i === slideNr ? "Slider__slide-wrapper--active" : ""
            }`}
          >
            <Slide slide={slide} />
          </div>
        ))}
      </div>

      {/* Slide navigator */}
      <div className="Slider__go-to-slide-wrapper">
        {slideData.map((_, i) => {
          const active = i + bufferCount === slideNr ? true : false;
          return (
            <div key={i}>
              <GoToSlide
                active={active}
                handleClick={() => handleClickOnGoToSlide(i + bufferCount)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
