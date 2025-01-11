'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

export function Intro() {
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
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-left" style={whiteTextStyle}>
              UrbanTALES: A comprehensive dataset of Urban Turbulent Airflow using systematic Large Eddy Simulations (LES)
            </h1>
            <p className="text-base md:text-xl lg:text-2xl" style={whiteTextStyle}>
              Understanding urban turbulent airflow through high-resolution LES simulations
            </p>
            <ul className="text-base md:text-xl lg:text-2xl list-none pl-6 pt-5 space-y-2">
              {[
                'Turbulent airflow over 538 urban configurations was simulated using the state-of-the-art LES model, amounting to the largest urban flow dataset openly available.',
                'Rigorous validated and quality controlled.',
                'The simulation outputs were processed to facilitate urban canopy parameterization and general urban climate modelling practice.'
              ].map((item, index) => (
                <li key={index} style={whiteTextStyle}>
                  {index + 1}. {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="container mx-auto flex flex-col items-center">
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
        </div>
      </div>
    </div>
  )
}

