import React from 'react';
import useGameLayout from '../hooks/useGameLayout';

export default function GameLayoutWrapper({ children }) {
  useGameLayout();
  return <>{children}</>;
}
