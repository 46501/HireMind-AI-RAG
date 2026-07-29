import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { KnowledgeBase } from "./pages/KnowledgeBase";
import { Chat } from "./pages/Chat";
import { ResumeAnalyzer } from "./pages/ResumeAnalyzer";
import { Roadmap } from "./pages/Roadmap";
import { InterviewPrep } from "./pages/InterviewPrep";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="knowledge" element={<KnowledgeBase />} />
          <Route path="chat" element={<Chat />} />
          <Route path="resume" element={<ResumeAnalyzer />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="interview" element={<InterviewPrep />} />
          <Route path="*" element={<div className="flex h-full items-center justify-center font-bold text-2xl text-muted-foreground">Coming Soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
