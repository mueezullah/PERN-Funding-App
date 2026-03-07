import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { About } from "./components/about";
import { Campaigns } from "./components/campaigns";
import { Footer } from "./components/footer";
import { Outlet } from "react-router-dom";

export default function LandingPage({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <div className="min-h-screen bg-white">
      <Navbar isAuthenticated={isAuthenticated} />
      <main>
        <Hero />
        <About />
        <Campaigns />
      </main>
      <Footer />
      <Outlet />
    </div>
  );
}
