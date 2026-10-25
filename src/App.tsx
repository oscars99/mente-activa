import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ExercisePage } from './pages/ExercisePage';
import { Home } from './pages/Home';
import { Onboarding } from './pages/Onboarding';
import { SettingsPage } from './pages/SettingsPage';
import { Train } from './pages/Train';
import { useAppState } from './state/AppState';

// The charts library is large; only load it when the progress page is opened.
const Progress = lazy(() => import('./pages/Progress').then((m) => ({ default: m.Progress })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  const { data } = useAppState();
  if (!data.profile) return <Onboarding />;

  return (
    // Hash routing works on any static host without server rewrites.
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/entrenar" element={<Train />} />
        <Route path="/ejercicio/:id" element={<ExercisePage />} />
        <Route
          path="/progreso"
          element={
            <Suspense fallback={null}>
              <Progress />
            </Suspense>
          }
        />
        <Route path="/ajustes" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
