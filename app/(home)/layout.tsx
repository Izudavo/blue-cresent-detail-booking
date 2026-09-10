import { FloatingContactActions } from "@/app/components/FloatingContactActions";
import { Nav } from "./sections/Nav";
import { Footer } from "./sections/Footer";


export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-background">
      <div>
        <Nav />
        <main>{children}</main>
      </div>

      <Footer />

      <FloatingContactActions />
    </div>
  );
}