import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EmojiProvider } from 'react-apple-emojis';
import emojiData from 'react-apple-emojis/src/data.json';
import AppInitializer from './components/AppInitializer';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileSelect from './pages/ProfileSelect';
import Home from './pages/Home';
import Ranking from './pages/Ranking';
import Profile from './pages/Profile';
import Memories from './pages/Memories';

function App() {
  return (
    <EmojiProvider data={emojiData}>
      <AppInitializer>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProfileSelect />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/ranking" element={<Ranking />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/memories" element={<Memories />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </EmojiProvider>
  );
}

export default App;
