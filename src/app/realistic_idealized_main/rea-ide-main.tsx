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
    <div className="bg-gray-100 pt-6 pb-10">
      <main className="container mx-auto px-4 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-24 justify-center">
          <Card className="flex flex-col max-w-[500px] w-full shadow-md mx-auto ">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Idealized building blocks
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
                  224 LES simulations over idealized building arrays were
                  performed at 0.5 m resolution horizontally and vertically
                </p>
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      8 plan area densities from 0.0625 to 0.64, covering most
                      urban configurations in global cities.
                    </span>
                  </li>
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      2 horizontal configurations (staggered and aligned)
                    </span>
                  </li>
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      7 building height distributions with Hstd = [0m,2.8m,5.6m]
                    </span>
                  </li>
                  <li className="flex">
                    <span className="text-lg mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      2 wind directions (perpendicular and oblique to building
                      blocks)
                    </span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/realistic_viz" passHref>
                <Button variant="outline" className="shadow-sm">
                  Learn more
                </Button>
              </Link>
              <Link href="/download_ideal" passHref>
                <Button className="shadow-md">Download data</Button>
              </Link>
            </CardFooter>
          </Card>
          <Card className="flex flex-col max-w-[500px] shadow-md w-full mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                Realistic urban neighbourhoods
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
                  314 LES simulations over realistic urban neighbourhoods were
                  performed at 0.5 resolution vertically and 1m horizontally.
                </p>
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      A representative range of urban densities is considered
                      (0.05-0.75) in global cities.
                    </span>
                  </li>
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>
                      Realistic urban geometries from 62 cities in 20 countries.
                    </span>
                  </li>
                  <li className="flex">
                    <span className="text-xl mr-2 flex-shrink-0 leading-[1.4]">
                      •
                    </span>
                    <span>Covering multiple wind directions.</span>
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/realistic_viz" passHref>
                <Button variant="outline" className="shadow-sm">
                  Learn more
                </Button>
              </Link>
              <Link href="/download_rea" passHref>
                <Button className="shadow-md">Download data</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
