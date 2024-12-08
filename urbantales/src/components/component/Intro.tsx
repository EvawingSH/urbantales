'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export function Intro() {
  const [showDetails, setShowDetails] = useState(false)

  const toggleDetails = () => setShowDetails(!showDetails)

  const whiteTextStyle = { color: 'white' }

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <Image
        src="/UrbanMain.svg"
        alt="3D model of urban cityscape"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-between p-6 md:p-12">
        <div className="container mx-auto">
      
  
            {!showDetails ? (
                  <div className="max-w-6xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-left" style={whiteTextStyle}>
              What morphological parameters dominate realistic urban flow at microscale and mesoscale?
            </h1>
              <p className="text-base md:text-xl lg:text-2xl" style={whiteTextStyle}>
                Most studies relies on a limited representation of urban areas to answer this question, posing challenges in extrapolating findings and introducing uncertainties in surface flux parameterizations. 
                We introduce a comprehensive dataset of Urban Tubulent Airflow using LES.
              </p>
              </div>
            ) : (
                <div>
                     <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-left" style={whiteTextStyle}>
              UrbanTALES: A comprehensive dataset of Urban Turbulent Airflow using systematic Large Eddy Simulations (LES)
            </h1>
             <p className="text-base md:text-xl lg:text-2xl" style={whiteTextStyle}>
               We present a comprehensive dataset of Urban Tubulent Airflow using LES that:
              </p>
              <ul className="text-base md:text-xl lg:text-2xl list-none pl-6 pt-5 space-y-2">
                {['cover a range of horizontal and vertical heterogeneities seen in realistic urban neighborhoods',
                  'facilitate systematic assessments of urban form impact on urban canopy processes',
                  'provide insights for various urban canopy models',
                  'openly available'].map((item, index) => (
                  <li key={index} style={whiteTextStyle}>
                    {index + 1}. {item}
                  </li>
                  
                ))}
              </ul>
              </div>
            )}
      
        </div>
        <div className="container mx-auto flex flex-col items-center">
          {!showDetails ? (
            <button 
              onClick={toggleDetails}
              className="group flex flex-col items-center"
            >
              <div 
                className="w-16 h-16 border-2 border-white flex items-center justify-center"
                style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%'
                  }}
              >
                <ChevronDown className="h-8 w-8" style={whiteTextStyle}/>
              </div>
              <span className="mt-2 text-md md:text-base group-hover:font-semibold group-hover:underline" style={whiteTextStyle}>
                Learn more
              </span>
            </button>
          ) : (
            <Link href="/realistic_idealized_main" className="group flex flex-col items-center">
               <div 
                className="w-16 h-16 border-2 border-white flex items-center justify-center"
                style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%'
                  }}
              >
                <ChevronDown className="h-8 w-8" style={whiteTextStyle}/>
              </div>
              <span className="mt-2 text-md md:text-base group-hover:font-semibold group-hover:underline" style={whiteTextStyle}>
                Learn more
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}