import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BoardProvider } from "./context/BoardContext";
import { Home } from "./pages/Home";
import { BoardPage } from "./pages/BoardPage";

export default function App() {
  return (
    <BoardProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/board/:boardId" element={<BoardPage />} />
        </Routes>
      </BrowserRouter>
    </BoardProvider>
  );
}
