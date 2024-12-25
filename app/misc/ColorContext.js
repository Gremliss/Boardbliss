import React, { createContext, useState } from "react";

const ColorContext = createContext();

const ColorProvider = ({ children }) => {
  const [currentColors, setCurrentColors] = useState({
    DARK: "#222831",
    LIGHT: "#EEEEEE",
    PRIMARY: "#007980",
    GRAY: "#505762",
    RED: "#874C62",
    LIST_COLOR_ONE: "#00798030",
    LIST_COLOR_TWO: "#00798010",
    PLACEHOLDER: "#EEEEEE70",
    BACKGROUND: "#00798050",
    PRIMARY_OPACITY: "#00798070",
    LIGHT_YELLOW: "#F9F3CC80",
  });

  return (
    <ColorContext.Provider value={{ currentColors, setCurrentColors }}>
      {children}
    </ColorContext.Provider>
  );
};

export { ColorContext, ColorProvider };
