import Image from "next/image";
import { Header } from "@/components/component/header";
import { Footer } from "@/components/component/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4">
      <Header />
      <div className="max-w-4xl w-full space-y-8 text-center">
        <h1 className="text-3xl font-bold mb-8 pt-8">
          The visualization is coming soon...
        </h1>
        <div className="relative w-full max-w-4xl h-[600px]">
          <Image
            src="/Rea_viz.png"
            alt="Realistic urban neighbourhoods visualization"
            fill
            style={{
              objectFit: "contain",
              filter: "drop-shadow(6px 6px 8px rgba(0, 0, 0, 0.1))",
            }}
            priority
          />
        </div>
        <Link href="/realistic_idealized_main" passHref>
          <Button variant="ghost" className="px-2 py-2 text-lg">
            <ArrowLeft className="mr-2 h-6 w-6" />
            Back
          </Button>
        </Link>
      </div>

      <Footer />
    </div>
  );
}
