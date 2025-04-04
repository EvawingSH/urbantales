import { Header } from "@/components/component/header"
import { Footer } from "@/components/component/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Page() {
  return (
    <div>
      <Header />
      <main className="flex-1 flex items-center h-screen justify-center px-4">
        <div className="max-w-4xl w-full space-y-8 text-center">
          <h1 className="text-3xl font-bold mb-8 pt-8">The visualization is coming soon...</h1>
          <Link href="/realistic_idealized_main" passHref>
            <Button variant="ghost" className="px-2 py-2 text-lg">
              <ArrowLeft className="mr-2 h-6 w-6" />
              Back
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}


