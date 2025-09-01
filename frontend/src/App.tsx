import React from 'react';
import { TradingJournal } from './components/TradingJournal';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <TradingJournal />
    </ErrorBoundary>
  );
}

export default App;
