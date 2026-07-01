import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// Yooga brand themed high-quality premium loader fallback for code splitting
const PageLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] w-full p-8 space-y-5 animate-pulse" role="status" aria-live="polite">
      {/* High-quality rotating spinner with Yooga brand gradient colors */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100/80 dark:border-slate-800/80"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-l-yooga-primary border-b-yooga-secondary animate-spin"></div>
      </div>
      
      <div className="flex flex-col items-center text-center space-y-1">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Carregando simulador...
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[260px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Preparando sua experiência de atendimento de alta conversão.
        </p>
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              <LayoutWrapper currentPageName={mainPageKey}>
                <MainPage />
              </LayoutWrapper>
            } />
            {Object.entries(Pages).map(([path, Page]) => (
              <Route
                key={path}
                path={`/${path}`}
                element={
                  <LayoutWrapper currentPageName={path}>
                    <Page />
                  </LayoutWrapper>
                }
              />
            ))}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
