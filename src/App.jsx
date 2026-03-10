import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ProfilePage from './pages/SettingsPage'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;