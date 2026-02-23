import { Outlet } from "react-router-dom";
import Footer from "./Footer/Footer";
import Header from "./Header/Header";
import ScrollToTop from "./ScrollToTop/ScrollToTop";

export default function Layout() {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="page-content">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
