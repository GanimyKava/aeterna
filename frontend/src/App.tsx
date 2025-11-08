import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { LoadingScreen } from "./components/LoadingScreen";

const HomePage = lazy(() => import("./pages/HomePage"));
const MarkerPage = lazy(() => import("./pages/MarkerPage"));
const ImagePage = lazy(() => import("./pages/ImagePage"));
const LocationPage = lazy(() => import("./pages/LocationPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const HelpPage = lazy(() => import("./pages/HelpPage"));

function App(): JSX.Element {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ar/marker" element={<MarkerPage />} />
          <Route path="/ar/image" element={<ImagePage />} />
          <Route path="/ar/location" element={<LocationPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

export default App;

