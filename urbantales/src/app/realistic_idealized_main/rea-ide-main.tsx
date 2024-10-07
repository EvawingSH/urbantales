import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export function ReaIdeMain() {
  return (
    <div className="min-h-screen bg-gray-100 pt-6 ">
      <main className="container mx-auto px-4 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-24 justify-center">
          <Card className="flex flex-col max-w-[500px] w-full shadow-md mx-auto ">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Idealized models
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="w-full h-[250px] sm:h-[200px] md:h-[300px] relative mb-4">
                <Image
                  src="/idealized.png"
                  alt="Idealized urban array model"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="mt-4 text-md space-y-3">
                <p className="font-semibold mb-2">
                  224 LES simulations of idealized urban arrays performed at 0.5
                  m resolution
                </p>
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      8 plan area densities (λ_p) considered covering the
                      densities in global cities
                    </span>
                  </li>
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>2 configurations of urban layout considered</span>
                  </li>
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      4 neighborhood types with 3 height distributions (0-5.6m)
                    </span>
                  </li>
                  <li className="flex">
                    <span className="text-lg mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>2 wind directions (perpendicular and oblique)</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="shadow-sm">
                Learn more
              </Button>
              <Link href="/download_ideal" passHref>  
              <Button className="shadow-md">Download data</Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="flex flex-col max-w-[500px] shadow-md w-full mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Realistic models
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="w-full h-[250px] sm:h-[200px] md:h-[300px] relative mb-4">
                <Image
                  src="/realistic.png"
                  alt="Realistic urban array model"
                  fill
                  className="object-cover rounded-md"
                />
              </div>
              <div className="mt-4 text-md space-y-3">
                <p className="font-semibold mb-2">
                  288 LES simulations of realistic urban arrays performed at 1 m
                  resolution
                </p>
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      A representative range plan area densities (λ_p)
                      considered covering the densities in global cities
                    </span>
                  </li>
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      Realistic configurations from 62 cities in 20 countries
                    </span>
                  </li>
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      4x4km^2 - 1x1km^2 neighborhoods taken via OSM2LES python
                      library
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="shadow-sm">
                Learn more
              </Button>
              <Link href="/download_ideal" passHref>  
              <Button className="shadow-md">Download data</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
