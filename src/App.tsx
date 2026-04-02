import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EmojiProvider } from 'react-apple-emojis';
import emojiData from 'react-apple-emojis/src/data.json';
import AppInitializer from './core/components/AppInitializer';
import ProtectedRoute from './core/components/ProtectedRoute';
import LandingRouter from './landing/LandingRouter';
import VoiceButton from './core/components/VoiceButton/VoiceButton';
import PushPrompt from './core/components/PushPrompt';

// Lazy-loaded pages
const ProfileSelect = lazy(() => import('./auth/ProfileSelect'));
const Onboarding = lazy(() => import('./auth/Onboarding'));
const ModuleSelect = lazy(() => import('./auth/ModuleSelect'));
const MemberProfile = lazy(() => import('./auth/MemberProfile'));
const GlobalRankingPage = lazy(() => import('./hub/GlobalRankingPage'));

// Landing legal pages
const TermosPage = lazy(() => import('./landing/TermosPage'));
const PrivacidadePage = lazy(() => import('./landing/PrivacidadePage'));

// FamilyChef
const ChefLayout = lazy(() => import('./modules/chef/components/Layout'));
const ChefHome = lazy(() => import('./modules/chef/pages/Home'));
const ChefRanking = lazy(() => import('./modules/chef/pages/Ranking'));
const ChefProfile = lazy(() => import('./modules/chef/pages/Profile'));
const Memories = lazy(() => import('./modules/chef/pages/Memories'));

// FamilyHome
const HomeLayout = lazy(() => import('./modules/home/components/HomeLayout'));
const Today = lazy(() => import('./modules/home/pages/Today'));
const All = lazy(() => import('./modules/home/pages/All'));
const HomeRanking = lazy(() => import('./modules/home/pages/Ranking'));
const Recurring = lazy(() => import('./modules/home/pages/Recurring'));
const History = lazy(() => import('./modules/home/pages/History'));

// FamilyFin
const FinLayout = lazy(() => import('./modules/fin/components/FinLayout'));
const FinGuard = lazy(() => import('./modules/fin/components/FinGuard'));
const FinHome = lazy(() => import('./modules/fin/pages/FinHome'));
const FinExpenses = lazy(() => import('./modules/fin/pages/FinExpenses'));
const FinDebts = lazy(() => import('./modules/fin/pages/FinDebts'));
const FinGoals = lazy(() => import('./modules/fin/pages/FinGoals'));
const FinBudget = lazy(() => import('./modules/fin/pages/FinBudget'));
const FinRanking = lazy(() => import('./modules/fin/pages/FinRanking'));

const LoadingSpinner = () => (
  <div className="flex h-svh items-center justify-center bg-[#FAFAF8]">
    <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-[#FF6B6B]" />
  </div>
);

function App() {
  return (
    <EmojiProvider data={emojiData}>
      <AppInitializer>
        <BrowserRouter>
          <VoiceButton />
          <PushPrompt />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Landing page pública */}
              <Route path="/" element={<LandingRouter />} />

              {/* Legal pages */}
              <Route path="/termos" element={<TermosPage />} />
              <Route path="/privacidade" element={<PrivacidadePage />} />

              {/* Auth */}
              <Route path="/login" element={<ProfileSelect />} />
              <Route path="/onboarding" element={<Onboarding />} />
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
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AppInitializer>
    </EmojiProvider>
  );
}

export default App;
