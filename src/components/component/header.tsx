"use client";
import Link from "next/link";
import Image from 'next/image';
import { useState } from 'react';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
  
    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen)
    }
  
    return (
      <header className="w-full bg-white shadow-sm py-1">
        <div className="container mx-auto px-0 flex items-center justify-between">
          <nav className="hidden md:flex space-x-6">
            <Link 
              href="/" 
              className="text-gray-600 font-semibold hover:text-gray-800 nav-link"
            >
              Home
            </Link>
            <Link 
              href="/About" 
              className="text-gray-600 font-semibold hover:text-gray-800 nav-link"
            >
              About
            </Link>
            <Link 
              href="/download_ideal" 
              className="text-gray-600 font-semibold hover:text-gray-800 nav-link"
            >
              Idealized building blocks
            </Link>
            <Link 
              href="/download_rea" 
              className="text-gray-600 font-semibold hover:text-gray-800 nav-link"
            >
              Realistic urban neighbourhoods
            </Link>
          </nav>
          <div className="flex items-center space-x-2">
            <Link href="https://www.unsw.edu.au/" target="_blank">
              <Image
                src="/UNSW.svg"
                alt="UNSW Logo"
                width={95}
                height={65}
                className="width-auto"
              />
            </Link>
            <Link href="https://www.climate-resilientcities.com/" target="_blank" className="text-md font-bold text-gray-800">
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
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        
        {/* Mobile menu */}
        <div 
          className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:hidden z-50 mobile-menu`}
        >
          <div className="p-4 bg-white h-full">
            <nav className="mt-8 space-y-4">
            <Link 
                href="/" 
                className="block text-gray-600 font-semibold hover:text-gray-800 nav-link-mobile"
              >
                Home
              </Link>
              <Link 
                href="/About" 
                className="block text-gray-600 font-semibold hover:text-gray-800 nav-link-mobile"
              >
                About
              </Link>
              <Link 
                href="/download_ideal" 
                className="block text-gray-600 font-semibold hover:text-gray-800 nav-link-mobile"
              >
                Idealized building blocks
              </Link>
              <Link 
                href="/download_rea" 
                className="block text-gray-600 font-semibold hover:text-gray-800 nav-link-mobile"
              >
                Realistic urban neighbourhoods
              </Link>
          

            </nav>
          </div>
        </div>
        
        {/* Overlay */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={toggleMenu}
          ></div>
        )}
      </header>
    )
}

