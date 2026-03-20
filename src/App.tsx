import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EmojiProvider } from 'react-apple-emojis';
import emojiData from 'react-apple-emojis/src/data.json';
import AppInitializer from './core/components/AppInitializer';
import ProtectedRoute from './core/components/ProtectedRoute';
import ProfileSelect from './auth/ProfileSelect';
import ModuleSelect from './auth/ModuleSelect';
import MemberProfile from './auth/MemberProfile';
import GlobalRankingPage from './hub/GlobalRankingPage';
import ChefLayout from './modules/chef/components/Layout';
import ChefHome from './modules/chef/pages/Home';
import ChefRanking from './modules/chef/pages/Ranking';
import ChefProfile from './modules/chef/pages/Profile';
import Memories from './modules/chef/pages/Memories';
import HomeLayout from './modules/home/components/HomeLayout';
import Today from './modules/home/pages/Today';
import All from './modules/home/pages/All';
import HomeRanking from './modules/home/pages/Ranking';
import Recurring from './modules/home/pages/Recurring';
import History from './modules/home/pages/History';
import FinLayout from './modules/fin/components/FinLayout';
import FinGuard from './modules/fin/components/FinGuard';
import FinHome from './modules/fin/pages/FinHome';
import FinExpenses from './modules/fin/pages/FinExpenses';
import FinDebts from './modules/fin/pages/FinDebts';
import FinGoals from './modules/fin/pages/FinGoals';
import FinBudget from './modules/fin/pages/FinBudget';
import FinRanking from './modules/fin/pages/FinRanking';
import VoiceButton from './core/components/VoiceButton/VoiceButton';

function App() {
  return (
    <EmojiProvider data={emojiData}>
      <AppInitializer>
        <BrowserRouter>
          <VoiceButton />
          <Routes>
            {/* Auth */}
            <Route path="/" element={<ProfileSelect />} />
            <Route
              path="/select-module"
              element={
                <ProtectedRoute>
                  <ModuleSelect />
                </ProtectedRoute>
              }
            />

            {/* Global profile & ranking */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MemberProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ranking"
              element={
                <ProtectedRoute>
                  <GlobalRankingPage />
                </ProtectedRoute>
              }
            />

            {/* FamilyChef */}
            <Route
              element={
                <ProtectedRoute>
                  <ChefLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/chef" element={<ChefHome />} />
              <Route path="/chef/ranking" element={<ChefRanking />} />
              <Route path="/chef/profile" element={<ChefProfile />} />
              <Route path="/chef/memories" element={<Memories />} />
            </Route>

            {/* FamilyHome */}
            <Route
              element={
                <ProtectedRoute>
                  <HomeLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home-tasks" element={<Today />} />
              <Route path="/home-tasks/all" element={<All />} />
              <Route path="/home-tasks/ranking" element={<HomeRanking />} />
              <Route path="/home-tasks/recurring" element={<Recurring />} />
              <Route path="/home-tasks/history" element={<History />} />
            </Route>

            {/* FamilyFin (Leticia excluída) */}
            <Route
              element={
                <ProtectedRoute>
                  <FinGuard>
                    <FinLayout />
                  </FinGuard>
                </ProtectedRoute>
              }
            >
              <Route path="/fin" element={<FinHome />} />
              <Route path="/fin/expenses" element={<FinExpenses />} />
              <Route path="/fin/debts" element={<FinDebts />} />
              <Route path="/fin/goals" element={<FinGoals />} />
              <Route path="/fin/budget" element={<FinBudget />} />
              <Route path="/fin/ranking" element={<FinRanking />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppInitializer>
    </EmojiProvider>
  );
}

export default App;
