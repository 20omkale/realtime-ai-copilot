import MainLayout from "./layouts/MainLayout";
import TranscriptPanel from "./components/TranscriptPanel";
import SuggestionsPanel from "./components/SuggestionsPanel";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  return (
    <MainLayout>
      <TranscriptPanel />
      <SuggestionsPanel />
      <ChatPanel />
    </MainLayout>
  );
}