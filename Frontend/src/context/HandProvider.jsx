import { createContext, useState } from 'react';

const HandContext = createContext();

const HandProvider = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <HandContext.Provider value={{ currentIndex, setCurrentIndex }}>
      {children}
    </HandContext.Provider>
  );
};

export { HandContext, HandProvider };