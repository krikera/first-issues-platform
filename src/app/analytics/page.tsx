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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="text-muted-foreground">Loading analytics dashboard...</p>
    </div>
  </div>
);

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Suspense fallback={<AnalyticsLoading />}>
          <AnalyticsDashboard />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
