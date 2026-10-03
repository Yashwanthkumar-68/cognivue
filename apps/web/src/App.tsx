import React from 'react';
import { LearnLensChatStudio } from './screens/LearnLensChatStudio.js';

export const App: React.FC = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <LearnLensChatStudio />
    </div>
  );
};

export default App;
