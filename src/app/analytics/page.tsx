"use client";

import { Suspense, lazy } from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

const AnalyticsDashboard = lazy(
  () => import("@/components/AnalyticsDashboard")
);

const AnalyticsLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-[14px] text-ink-subtle font-mono">Loading analytics...</p>
    </div>
  </div>
);

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas text-ink">
      <NavBar />
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Suspense fallback={<AnalyticsLoading />}>
          <AnalyticsDashboard />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
