import React, { useEffect } from 'react';
import { useStudioStore } from './stores/useStudioStore.js';
import { Navbar } from './components/Navbar.js';
import { LandingScreen } from './screens/LandingScreen.js';
import { ChatFirstStudio } from './screens/ChatFirstStudio.js';
import { KnowledgeGraphScreen } from './screens/KnowledgeGraphScreen.js';
import { MisconceptionCenterScreen } from './screens/MisconceptionCenterScreen.js';
import { ElahEditorScreen } from './screens/ElahEditorScreen.js';
import { SkillTraceChatScreen } from './screens/SkillTraceChatScreen.js';
import { LearningTwinScreen } from './screens/LearningTwinScreen.js';
import { LearningGapMapScreen } from './screens/LearningGapMapScreen.js';
import { SourceConflictScreen } from './screens/SourceConflictScreen.js';
import { SourceImportScreen } from './screens/SourceImportScreen.js';
import { GemmaAnalysisScreen } from './screens/GemmaAnalysisScreen.js';
import { ExamModeScreen } from './screens/ExamModeScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';
import { Sparkles, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const { currentScreen, isLoading, statusMessage } = useStudioStore();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'chat_first':
        return <ChatFirstStudio />;
      case 'landing':
        return <LandingScreen />;
      case 'knowledge_graph':
        return <KnowledgeGraphScreen />;
      case 'misconception_center':
        return <MisconceptionCenterScreen />;
      case 'lesson_editor':
        return <ElahEditorScreen />;
      case 'skilltrace_chat':
        return <SkillTraceChatScreen />;
      case 'learning_twin':
        return <LearningTwinScreen />;
      case 'gap_map':
        return <LearningGapMapScreen />;
      case 'conflict_viewer':
        return <SourceConflictScreen />;
      case 'import':
        return <SourceImportScreen />;
      case 'gemma_analysis':
        return <GemmaAnalysisScreen />;
      case 'exam_mode':
        return <ExamModeScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <ChatFirstStudio />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />

      {/* Floating Status Notification Bar */}
      {statusMessage && (
        <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-purple-950/80 border-b border-cyan-500/20 px-4 py-2 text-xs font-mono text-cyan-300 flex items-center justify-between z-40 transition-all">
          <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{statusMessage}</span>
            </div>
            {isLoading && (
              <span className="text-[10px] text-slate-400 animate-pulse">Processing multimodal pipeline...</span>
            )}
          </div>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="flex-1">
        {renderActiveScreen()}
      </main>
    </div>
  );
};

export default App;
