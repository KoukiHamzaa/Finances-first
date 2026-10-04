import * as React from 'react';
import * as DirectionPrimitive from '@radix-ui/react-direction';

const DirectionContext = React.createContext('rtl');

function DirectionProvider({dir = 'rtl', children}) {
  return (
    <DirectionPrimitive.Provider dir={dir}>
      <DirectionContext.Provider value={dir}>{children}</DirectionContext.Provider>
    </DirectionPrimitive.Provider>
  );
}

function useDirection() {
  return React.useContext(DirectionContext);
}

export {DirectionProvider, useDirection};