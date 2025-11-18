import { ReactNode } from "react";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
      <Footer />
    </div>
  );
}
