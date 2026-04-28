import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { PageTransition } from "@/components/layout/PageTransition";

export default function MainLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PageTransition>
        <main>{children}</main>
      </PageTransition>
      <Footer />
    </div>
  );
}
