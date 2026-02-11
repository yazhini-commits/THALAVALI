import { createContext, useState } from "react";

export const ABContext = createContext();

export function ABProvider({ children }) {

  const [abData, setAbData] = useState(null);

  /*
    abData structure:

    {
      type: "LinkedIn Post",
      promptA: "...",
      promptB: "...",
      resultA: null,
      resultB: null,
      generating: true
    }
  */

  const startABTest = ({ type, promptA, promptB }) => {
    setAbData({
      type,
      promptA,
      promptB,
      resultA: null,
      resultB: null,
      generating: true,
    });
  };

  const setABResults = (resultA, resultB) => {
    setAbData(prev => ({
      ...prev,
      resultA,
      resultB,
      generating: false,
    }));
  };

  const clearAB = () => {
    setAbData(null);
  };

  return (
    <ABContext.Provider value={{ abData, startABTest, setABResults, clearAB }}>
      {children}
    </ABContext.Provider>
  );
}
