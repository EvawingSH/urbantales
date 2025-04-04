import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full bg-gray-100 py-6 border-t border-gray-200">
      <div className="container mx-auto px-4">
        <nav className="flex flex-wrap justify-between" aria-label="Footer">
          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <h3 className="text-base font-medium text-gray-700 mb-2">Publications</h3>
            <Link href="/publications" className="text-sm text-gray-500 hover:text-gray-900">
              Nazarian et al., (2025): UrbanTALES: A comprehensive dataset of Urban Turbulent Airflow using systematic
              Large Eddy Simulations (doi link to be added here)
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
            <Link href="/About" className="text-sm text-gray-500 hover:text-gray-900">
              Assoc. Prof. Negin Nazarian, Dr. Jiachen Lu, Dr. Mathew Lipson, Porf. Melissa Anne Hart, Dr. Sijie Liu,
              Assoc.Prof. Scott Kraynhoff, Dr. Lewis Blunn, Prof. Alberto Martili
            </Link>
          </div>
          <div className="w-full sm:w-1/2 md:w-1/4 px-4 mb-4">
            <h3 className="text-base font-medium text-gray-700 mb-2">Contact</h3>
            <a href="mailto:n.nazarian@unsw.edu.au" className="text-sm text-blue-500 hover:underline">
              n.nazarian@unsw.edu.au
            </a>
          </div>
        </nav>
        <div className="w-full px-4 mt-6 text-sm text-gray-500 text-center">
          <p>
            All data uploaded are under a non-restrictive license - CC BY 4.0 Users must cite the original paper
            (Nazarian et al., (2025)) when using the data.
          </p>
        </div>
      </div>
    </footer>
  )
}
