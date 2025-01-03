import Link from 'next/link'

export function Footer() {
  return (
    <footer className="w-full bg-gray-100 mt-auto py-6 border-t border-gray-200">
      <div className="container mx-auto px-0">
        <nav className="flex flex-wrap justify-between" aria-label="Footer">
          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <h3 className="text-base font-medium text-gray-700 mb-2">Publications</h3>
            <Link href="/publications" className="text-sm text-gray-500 hover:text-gray-900">
              To be updated...
            </Link>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <h3 className="text-base font-medium text-gray-700 mb-2">Press Releases</h3>
            <Link href="/press-releases" className="text-sm text-gray-500 hover:text-gray-900">
              To be updated...
            </Link>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <h3 className="text-base font-medium text-gray-700 mb-2">Team</h3>
            <Link href="/team" className="text-sm text-gray-500 hover:text-gray-900">
              To be updated...
            </Link>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <h3 className="text-base font-medium text-gray-700 mb-2">Contact</h3>
            <Link href="/contact" className="text-sm text-gray-500 hover:text-gray-900">
              To be updated...
            </Link>
          </div>
        </nav>
      </div>
    </footer>
  )
}

