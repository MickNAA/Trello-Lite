import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { BoardPage } from "./pages/BoardPage";
import { ArchivePage } from "./pages/ArchivePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board/:boardId" element={<BoardPage />} />
        <Route path="/board/:boardId/archive" element={<ArchivePage />} />
      </Routes>
    </BrowserRouter>
  );
}