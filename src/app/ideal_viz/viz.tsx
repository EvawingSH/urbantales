"use client"

import { useState, useMemo, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { AlertTriangle, Download } from "lucide-react"
import * as THREE from "three"

// Import the column data
import columnData from "@/app/api/data/IdealizedModelmeta.json"

// Define types for our column data
interface FileInfo {
  "File Name": string
  "Direct Download Link": string
  "Size (MB)": number
}

interface ColumnCase {
  NameI: string
  "Folder Name": string
  Heights: number[]
  Color: string[]
  "Wind Direction": number
  areaDensity: number
  "Std of Building Height": number
  "Horizontal Configuration": "Aligned" | "Staggered"
  Files: FileInfo[]
}

// Map vertical configuration to standard deviation categories
function getStdDevFromVerticalConfig(verticalConfig: number): number {
  return verticalConfig || 0
}

// Function to download all files for a case
function downloadAllFiles(files: FileInfo[]) {
  files.forEach((file, index) => {
    // Add a small delay between downloads to avoid overwhelming the browser
    setTimeout(() => {
      const link = document.createElement("a")
      link.href = file["Direct Download Link"]
      link.download = file["File Name"]
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, index * 500) // 500ms delay between each download
  })
}

export default function ColumnGrid() {
  const [isStaggered, setIsStaggered] = useState(false)
  const [areaDensityIndex, setAreaDensityIndex] = useState(0)
  const [stdDevIndex, setStdDevIndex] = useState(0) // Start with first case
  const [windDirection, setWindDirection] = useState("0") // Add windDirection state

  const areaDensities = useMemo(() => {
    const uniqueAreaDensities = Array.from(
      new Set((columnData as unknown as ColumnCase[]).map((case_) => Number(case_.areaDensity) || 0)),
    )
    return uniqueAreaDensities.sort((a, b) => a - b)
  }, [])

  // Compute unique standard deviations from the data
  const standardDeviations = useMemo(() => {
    const uniqueStdDevs = Array.from(
      new Set((columnData as unknown as ColumnCase[]).map((case_) => Number(case_["Std of Building Height"]) || 0)),
    )
    return uniqueStdDevs.sort((a, b) => a - b)
  }, [])

  // Filter cases based on current settings
  const filteredCases = useMemo(() => {
    return (columnData as unknown as ColumnCase[]).filter((caseData) => {
      const matchesLayout = (caseData["Horizontal Configuration"] === "Aligned") === !isStaggered
      const matchesWind = Number(caseData["Wind Direction"]) === Number.parseInt(windDirection)
      const matchesDensity = Math.abs(Number(caseData.areaDensity) - areaDensities[areaDensityIndex]) < 0.001
      const matchesStdDev =
        Math.abs(Number(caseData["Std of Building Height"]) - standardDeviations[stdDevIndex]) < 0.001

      return matchesLayout && matchesWind && matchesDensity && matchesStdDev
    })
  }, [isStaggered, windDirection, areaDensityIndex, stdDevIndex, standardDeviations, areaDensities])

  // Check if there are any matching cases
  const hasMatchingCase = filteredCases.length > 0

  // Get current case (first matching case or fallback to first case in JSON)
  const currentCase = filteredCases[0] || (columnData as unknown as ColumnCase[])[0]

  // Find PNG file for current case
  const pngFile = currentCase?.Files?.find((file) => file["File Name"].toLowerCase().endsWith(".png"))

  const columnSize = Math.log((Number(currentCase?.areaDensity) || 0.0625) * 80)
  const currentStdDev = standardDeviations[stdDevIndex] || 0

  // Find the min and max heights for the current case (scaled by 10)
  const scaledHeights = currentCase?.Heights?.map((h) => Number(h) || 16) || [16]
  const minHeight = Math.min(...scaledHeights)
  const maxHeight = Math.max(...scaledHeights)

  return (
    <div className="w-full flex flex-col bg-gray-100">
      <style jsx>{`
        .slider-dark::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 2px 0 #555;
        }
        
        .slider-dark::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 0 2px 0 #555;
        }
      `}</style>
      {/* Page Title */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-0 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Idealized Building Blocks</h1>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="container mx-auto px-0 flex items-start justify-between py-4"
        style={{ height: "calc(100vh - 200px)" }}
      >
        {/* 3D Model Container - Left Side */}
        <div className="flex-1 mr-6 bg-white border border-gray-300 rounded-lg shadow-lg" style={{ height: "100%" }}>
          <div className="h-full flex flex-col">
            {/* Height Scale Legend - Always reserve space */}
            <div className="p-4 border-b bg-gray-50 flex-shrink-0" style={{ minHeight: "72px" }}>
              {hasMatchingCase ? (
                <div className="flex items-center justify-center">
                  <div className="text-center font-semibold mr-4">Height Scale (m)</div>
                  <div className="flex items-center">
                    <span className="mr-2 text-sm">{minHeight.toFixed(1)}</span>
                    <div
                      className="w-48 h-4"
                      style={{
                        background: "linear-gradient(to right, #ffffff, #000000)",
                        border: "1px solid #000",
                      }}
                    ></div>
                    <span className="ml-2 text-sm">{maxHeight.toFixed(1)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center font-semibold text-gray-400">Height Scale</div>
                </div>
              )}
            </div>

            <div className="flex-1 w-full">
              <Canvas shadows camera={{ position: [-45, 30, 45], fov: 50 }}>
                <color attach="background" args={["#ffffff"]} />
                <ambientLight intensity={1.0} />
                <Floor isStaggered={isStaggered} />
                {hasMatchingCase && <WindArrows2D direction={Number.parseInt(windDirection)} />}
                {hasMatchingCase && (
                  <ColumnGridComponent
                    isStaggered={isStaggered}
                    columnSize={columnSize}
                    columnHeights={scaledHeights}
                    columnColors={currentCase.Color || []}
                  />
                )}
                <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} enableDamping={false} />
                <Environment preset="city" />
              </Canvas>
            </div>

            {/* Controls at bottom - Fixed height */}
            <div className="bg-white border-t flex-shrink-0" style={{ minHeight: "200px" }}>
              <div className="p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* First row: Plan Area Density and Std of Building Height */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Plan Area Density: {(areaDensities[areaDensityIndex] || 0).toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, areaDensities.length - 1)}
                        step={1}
                        value={areaDensityIndex}
                        onChange={(e) => setAreaDensityIndex(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-dark"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        {areaDensities.map((density, index) => (
                          <span key={index} className={index === areaDensityIndex ? "font-bold" : ""}>
                            {(density || 0).toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Standard Deviation slider */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Std of Building Height: {getStdDevFromVerticalConfig(currentStdDev).toFixed(2)}
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={Math.max(0, standardDeviations.length - 1)}
                        step={1}
                        value={stdDevIndex}
                        onChange={(e) => setStdDevIndex(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-dark"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        {standardDeviations.map((sd, index) => (
                          <span key={index} className={index === stdDevIndex ? "font-bold" : ""}>
                            {getStdDevFromVerticalConfig(sd).toFixed(2)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Second row: Horizontal Configuration and Wind Direction */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Horizontal Configuration switch */}
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="staggered-mode"
                        checked={isStaggered}
                        onChange={(e) => setIsStaggered(e.target.checked)}
                        className="w-4 h-4 accent-gray-700 bg-gray-100 border-gray-300 rounded focus:ring-gray-500"
                      />
                      <label htmlFor="staggered-mode" className="text-sm font-medium text-gray-700">
                        Horizontal Configuration (Staggered)
                      </label>
                    </div>

                    {/* Wind Direction radio buttons */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Wind Direction</label>
                      <div className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="wind-0"
                            name="wind-direction"
                            value="0"
                            checked={windDirection === "0"}
                            onChange={(e) => setWindDirection(e.target.value)}
                            className="w-4 h-4 accent-gray-700 bg-gray-100 border-gray-300"
                          />
                          <label htmlFor="wind-0" className="text-sm text-gray-700">
                            0°
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="wind-45"
                            name="wind-direction"
                            value="45"
                            checked={windDirection === "45"}
                            onChange={(e) => setWindDirection(e.target.value)}
                            className="w-4 h-4 accent-gray-700 bg-gray-100 border-gray-300"
                          />
                          <label htmlFor="wind-45" className="text-sm text-gray-700">
                            45°
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Case Info Container - Right Side - Fixed height */}
        <div className="w-80 bg-white border border-gray-300 rounded-lg shadow-lg" style={{ height: "100%" }}>
          <div className="p-4 h-full overflow-y-auto">
            <div className="font-bold mb-4 text-lg">Case Information</div>

            {/* No matching case warning */}
            {!hasMatchingCase && (
              <div className="flex items-center mb-4 p-3 bg-red-50 border border-red-200 rounded">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                <span className="text-red-700 font-medium text-sm">No such case in the database</span>
              </div>
            )}

            {/* Case Details */}
            <div className="space-y-3 mb-4">
              <div>
                <span className="font-semibold text-gray-700 text-sm">Folder Name:</span>
                <div className="text-gray-900 text-sm">{hasMatchingCase ? currentCase["Folder Name"] : ""}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 text-sm">Plan Area Density:</span>
                <div className="text-gray-900 text-sm">
                  {hasMatchingCase ? (areaDensities[areaDensityIndex] || 0).toFixed(2) : ""}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 text-sm">Horizontal Configuration:</span>
                <div className="text-gray-900 text-sm">
                  {hasMatchingCase ? (isStaggered ? "Staggered" : "Aligned") : ""}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 text-sm">Wind Direction:</span>
                <div className="text-gray-900 text-sm">{hasMatchingCase ? `${windDirection}°` : ""}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700 text-sm">Std of Building Height:</span>
                <div className="text-gray-900 text-sm">
                  {hasMatchingCase ? getStdDevFromVerticalConfig(currentStdDev).toFixed(2) : ""}
                </div>
              </div>
            </div>

            {/* PNG Image */}
            {hasMatchingCase && pngFile && (
              <div className="mb-4">
                <div className="font-semibold text-gray-700 mb-2 text-sm">Preview Image:</div>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <img
                    src={pngFile["Direct Download Link"] || "/placeholder.svg"}
                    alt={`Preview for ${currentCase["Folder Name"]}`}
                    className="w-full h-auto"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              </div>
            )}

            {/* Download Button */}
            {hasMatchingCase && currentCase.Files && (
              <div className="mt-4">
                <button
                  onClick={() => downloadAllFiles(currentCase.Files)}
                  className="w-full flex items-center justify-center px-3 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All Files ({currentCase.Files.length} files)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Floor({ isStaggered }: { isStaggered: boolean }) {
  const floorWidth = 50
  const floorDepth = isStaggered ? 30 : 25

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[floorWidth, floorDepth]} />
      <meshStandardMaterial color="#a0a0a0" roughness={0.8} />
    </mesh>
  )
}

function Arrow2D({
  position,
  rotation,
  activeSegmentIndex,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  activeSegmentIndex: number
}) {
  const segments = useMemo(() => {
    const segments = []
    const arrowLength = 6
    const headLength = 2
    const headWidth = 1.5

    segments.push({
      points: [new THREE.Vector3(-arrowLength, 0, 0), new THREE.Vector3(-arrowLength * 0.75, 0, 0)],
      pointsOffset: [new THREE.Vector3(-arrowLength, 0.02, 0), new THREE.Vector3(-arrowLength * 0.75, 0.02, 0)],
    })

    segments.push({
      points: [new THREE.Vector3(-arrowLength * 0.75, 0, 0), new THREE.Vector3(-arrowLength * 0.25, 0, 0)],
      pointsOffset: [new THREE.Vector3(-arrowLength * 0.75, 0.02, 0), new THREE.Vector3(-arrowLength * 0.25, 0.02, 0)],
    })

    segments.push({
      points: [new THREE.Vector3(-arrowLength * 0.25, 0, 0), new THREE.Vector3(-headLength, 0, 0)],
      pointsOffset: [new THREE.Vector3(-arrowLength * 0.25, 0.02, 0), new THREE.Vector3(-headLength, 0.02, 0)],
    })

    segments.push({
      points: [
        new THREE.Vector3(-headLength, 0, 0),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-headLength, 0, -headWidth),
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(-headLength, 0, headWidth),
        new THREE.Vector3(0, 0, 0),
      ],
      pointsOffset: [
        new THREE.Vector3(-headLength, 0.02, 0),
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(-headLength, 0.02, -headWidth),
        new THREE.Vector3(0, 0.02, 0),
        new THREE.Vector3(-headLength, 0.02, headWidth),
        new THREE.Vector3(0, 0.02, 0),
      ],
    })

    return segments
  }, [])

  const normalColor = "#0052cc"
  const activeColor = "#00a8ff"

  return (
    <group position={position} rotation={rotation}>
      {segments.map((segment, index) => {
        const isActive = index === activeSegmentIndex
        const color = isActive ? activeColor : normalColor

        const geometry = new THREE.BufferGeometry().setFromPoints(segment.points)
        const geometryOffset = new THREE.BufferGeometry().setFromPoints(segment.pointsOffset)

        return (
          <group key={`segment-${index}`}>
            <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, linewidth: 3 }))} />
            <primitive object={new THREE.Line(geometryOffset, new THREE.LineBasicMaterial({ color, linewidth: 3 }))} />
          </group>
        )
      })}
    </group>
  )
}

function WindArrows2D({ direction }: { direction: number }) {
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0)
  const numSegments = 4

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSegmentIndex((prevIndex) => (prevIndex + 1) % numSegments)
    }, 150)

    return () => clearInterval(interval)
  }, [])

  const rotationY = (direction * Math.PI) / 180

  const arrows = []
  const arrowCount = 5
  const spacing = 6

  for (let i = 0; i < arrowCount; i++) {
    const z = -10 + i * spacing

    arrows.push(
      <Arrow2D key={i} position={[-25, 0.5, z]} rotation={[0, rotationY, 0]} activeSegmentIndex={activeSegmentIndex} />,
    )
  }

  return <>{arrows}</>
}

function Column({
  position,
  size,
  height,
  color,
}: {
  position: [number, number, number]
  size: number
  height: number
  color: string
}) {
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(size, height, size), [size, height])
  const edgesGeometry = useMemo(() => new THREE.EdgesGeometry(boxGeometry), [boxGeometry])

  const innerSize = size * 0.98
  const innerHeight = height * 0.98
  const innerBoxGeometry = useMemo(
    () => new THREE.BoxGeometry(innerSize, innerHeight, innerSize),
    [innerSize, innerHeight],
  )

  return (
    <group position={position}>
      <mesh geometry={boxGeometry}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.1} />
      </mesh>

      <mesh geometry={innerBoxGeometry}>
        <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.0} />
      </mesh>

      <mesh position={[0, height / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.0} />
      </mesh>

      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color="#000000" linewidth={2} />
      </lineSegments>
    </group>
  )
}

function ColumnGridComponent({
  isStaggered,
  columnSize,
  columnHeights,
  columnColors,
}: {
  isStaggered: boolean
  columnSize: number
  columnHeights: number[]
  columnColors: string[]
}) {
  const rows = 3
  const cols = isStaggered ? 6 : 5
  const spacing = 7

  const gridWidth = (cols - 1) * spacing
  const gridDepth = (rows - 1) * spacing
  const offsetX = -gridWidth / 2
  const offsetZ = -gridDepth / 2

  const columns = []

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = offsetX + col * spacing
      let z = offsetZ + row * spacing

      if (isStaggered && col % 2 === 1) {
        z += spacing / 2
      }

      const index = (rows - 1 - row) * cols + col
      const height = columnHeights[index] || 1.6
      const color = columnColors[index] || "#808080"

      columns.push(
        <Column key={`${row}-${col}`} position={[x, height / 2, z]} size={columnSize} height={height} color={color} />,
      )
    }
  }

  return <>{columns}</>
}
