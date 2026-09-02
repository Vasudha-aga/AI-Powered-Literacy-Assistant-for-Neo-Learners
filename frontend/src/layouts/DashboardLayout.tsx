import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen max-h-screen bg-background font-sans text-textPrimary relative overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 opacity-[0.15] pointer-events-none"
      >
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10 flex w-full h-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden">
          <div className="p-8 max-w-6xl mx-auto min-h-full pb-16">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
