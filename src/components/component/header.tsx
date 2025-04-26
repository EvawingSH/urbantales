"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleMobileDropdown = (name: string) => {
    setOpenMobileDropdown(openMobileDropdown === name ? null : name)
  }

  return (
    <header className="w-full bg-white shadow-sm py-1">
      <div className="container mx-auto px-0 flex items-center justify-between">
        <nav className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-600 font-semibold hover:text-gray-800 nav-link">
            Home
          </Link>
          <Link href="/About" className="text-gray-600 font-semibold hover:text-gray-800 nav-link">
            About
          </Link>

          {/* Idealized building blocks dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-600 font-semibold hover:text-gray-800 nav-link flex items-center">
              Idealized building blocks
              <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/ideal_viz" className="w-full">
                  Data visualization
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/download_ideal" className="w-full">
                  Data download
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Realistic urban neighbourhoods dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="text-gray-600 font-semibold hover:text-gray-800 nav-link flex items-center">
              Realistic urban neighbourhoods
              <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Link href="/realistic_viz" className="w-full">
                  Data visualization
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/download_rea" className="w-full">
                  Data download
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        <div className="flex items-center space-x-2">
          <Link href="https://www.unsw.edu.au/" target="_blank">
            <Image src="/UNSW.svg" alt="UNSW Logo" width={95} height={65} className="width-auto" />
          </Link>
          <Link
            href="https://www.climate-resilientcities.com/"
            target="_blank"
            className="text-md font-bold text-gray-800"
          >
            CRC Lab
          </Link>
        </div>

        <button className="md:hidden z-50" onClick={toggleMenu}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6 text-gray-600"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden z-50 mobile-menu overflow-y-auto`}
      >
        <div className="p-4 bg-white h-full">
          <nav className="mt-8 space-y-4">
            <Link
              href="/"
              className="block text-gray-600 font-semibold hover:text-gray-800 nav-link-mobile"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/About"
              className="block text-gray-600 font-semibold hover:text-gray-800 nav-link-mobile"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>

            {/* Mobile Idealized building blocks dropdown */}
            <Collapsible
              open={openMobileDropdown === "idealized"}
              onOpenChange={() => toggleMobileDropdown("idealized")}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full text-gray-600 font-semibold hover:text-gray-800 nav-link-mobile">
                Idealized building blocks
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${openMobileDropdown === "idealized" ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 mt-2 space-y-2">
                <Link
                  href="/ideal_viz"
                  className="block text-gray-600 hover:text-gray-800 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Data visualization
                </Link>
                <Link
                  href="/download_ideal"
                  className="block text-gray-600 hover:text-gray-800 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Data download
                </Link>
              </CollapsibleContent>
            </Collapsible>

            {/* Mobile Realistic urban neighbourhoods dropdown */}
            <Collapsible
              open={openMobileDropdown === "realistic"}
              onOpenChange={() => toggleMobileDropdown("realistic")}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full text-gray-600 font-semibold hover:text-gray-800 nav-link-mobile">
                Realistic urban neighbourhoods
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${openMobileDropdown === "realistic" ? "rotate-180" : ""}`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-4 mt-2 space-y-2">
                <Link
                  href="/realistic_viz"
                  className="block text-gray-600 hover:text-gray-800 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Data visualization
                </Link>
                <Link
                  href="/download_rea"
                  className="block text-gray-600 hover:text-gray-800 py-1"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Data download
                </Link>
              </CollapsibleContent>
            </Collapsible>
          </nav>
        </div>
      </div>

      {/* Overlay */}
      {isMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMenu}></div>}
    </header>
  )
}
