import * as React from 'react';
import {Direction} from 'radix-ui';

const DirectionContext = React.createContext('rtl');

function DirectionProvider({dir = 'rtl', children}) {
  return (
    <Direction.Provider dir={dir}>
      <DirectionContext.Provider value={dir}>{children}</DirectionContext.Provider>
    </Direction.Provider>
  );
}

function useDirection() {
  return React.useContext(DirectionContext);
}

export {DirectionProvider, useDirection};