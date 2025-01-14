"use client";
import Image from "next/image";

const teamMembers = [
  {
    name: "Assoc.Prof. Negin Nazarian",
    role: "Principal Investigator/Project Leader",
    email: "n.nazarian@unsw.edu.au",
    image: "/negin_nazarian.jpg?height=200&width=200",
  },
  {
    name: "Dr. Jiachen Lu",
    role: "Researcher",
    email: "jiachen.lu@unsw.edu.au",
    image: "/JiachenLu.jpeg?height=200&width=200",
  },
  {
    name: "Dr. Mathew Lipson",
    role: "Researcher",
    email: "m.lipson@unsw.edu.au",
    image: "/mathewLipson.jpeg?height=200&width=200",
  },
  {
    name: "Prof. Melissa Anne Hart",
    role: "Researcher",
    email: "melissa.hart@utas.edu.au",
    image: "/mah.jpg?height=200&width=200",
  },
  {
    name: "Dr. Sijie Liu",
    role: "Webapp Developer",
    email: "hello@sijieliu.com",
    image: "/sijieliu.jpg?height=200&width=200",
  },
  {
    name: "Assoc.Prof. Scott Kraynhoff",
    role: "Researcher",
    email: "skrayenh@uoguelph.ca",
    image: "/sk.jpg?height=200&width=200",
  },
  {
    name: "Dr. Lewis Blunn",
    role: "Researcher",
    email: "lewis.blunn@metoffice.gov.uk",
    image: "/lb.jpg?height=200&width=200",
  },
  {
    name: "Prof. Alberto Martilli",
    role: "Researcher",
    email: "alberto.martilli@ciemat.es",
    image: "/am.jpg?height=200&width=200",
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-left mb-12">About UrbanTALES</h1>
        {/* Intro */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">
            Introduction to UrbanTALES
          </h2>
          <p className="text-lg mb-4">
            UrbanTALES (Urban Turbulent Airflow using Large Eddy Simulations) is
            a comprehensive dataset that provides insights into urban turbulent
            airflow through high-resolution LES simulations.
          </p>
          <p className="text-lg mb-4">
            Our project aims to answer the critical question: What morphological
            parameters dominate realistic urban flow at microscale and
            mesoscale?
          </p>
          <ul className="list-disc list-inside text-lg">
            <li>
              Covers a range of horizontal and vertical heterogeneities seen in
              realistic urban neighborhoods
            </li>
            <li>
              Facilitates systematic assessments of urban form impact on urban
              canopy processes
            </li>
            <li>Provides insights for various urban canopy models</li>
            <li>
              Openly available for researchers and urban planners worldwide
            </li>
          </ul>
        </section>
        {/* Team */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Project Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="text-center">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={150}
                  height={150}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.role}</p>
                <a 
                  href={`ms-outlook://compose?to=${encodeURIComponent(member.email)}`}
                  className="text-blue-600 hover:underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `ms-outlook://compose?to=${encodeURIComponent(member.email)}`;
                  }}
                >
                  {member.email}
                </a>
              </div>
            ))}
          </div>
        </section>
        {/* Collaboration */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Collaboration</h2>
          <p className="text-lg mb-4">
            UrbanTALES is a collaborative effort involving multiple institutions
            and disciplines. We welcome partnerships and contributions from
            researchers, urban planners, and policymakers worldwide.
          </p>
          <h3 className="text-2xl font-semibold mb-2">How to Collaborate</h3>
          <ul className="list-disc list-inside text-lg mb-4">
            <li>Access our open dataset for your research</li>
            <li>Contribute to our ongoing simulations</li>
            <li>Participate in our workshops and conferences</li>
            <li>Propose joint research projects</li>
          </ul>
          <p className="text-lg">
            For collaboration inquiries, please contact us at{" "}
            <a
              href="mailto:collaborate@urbantales.org"
              className="text-blue-600 hover:underline"
            >
              n.nazarian@unsw.edu.au
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
