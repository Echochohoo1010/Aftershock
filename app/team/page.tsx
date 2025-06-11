import Link from "next/link"
import { Twitter, Linkedin, Github } from "lucide-react"

export default function Team() {
  const team = [
    {
      name: "Joel Christoph",
      role: "CEO",
      bio: "Joel leads the strategic direction of Exploratory Policy, bringing expertise in policy innovation and AI governance.",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Jonas Kgomo",
      role: "CPO",
      bio: "Jonas oversees product development, ensuring our tools effectively meet the needs of policymakers and researchers.",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Caleb Maresca",
      role: "CTO",
      bio: "Caleb leads our technical team, focusing on the development of causal AI models and simulation frameworks.",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
    {
      name: "Echo Huang",
      role: "Chief Operations Officer",
      bio: "Echo manages our operations, partnerships, and ensures the efficient execution of our research agenda.",
      social: {
        twitter: "#",
        linkedin: "#",
        github: "#",
      },
    },
  ]

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-12">Our Team</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {team.map((member, index) => (
            <div key={index} className="border-t-2 border-black dark:border-white pt-6">
              <div className="flex items-center mb-4">
                <div className="bg-gray-200 dark:bg-gray-700 h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold">
                  {member.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold">{member.name}</h3>
                  <p className="text-gray-700">{member.role}</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 mb-4">{member.bio}</p>
              <div className="flex space-x-4">
                <Link href={member.social.twitter} className="text-gray-600 hover:text-black">
                  <Twitter className="h-5 w-5" />
                </Link>
                <Link href={member.social.linkedin} className="text-gray-600 hover:text-black">
                  <Linkedin className="h-5 w-5" />
                </Link>
                <Link href={member.social.github} className="text-gray-600 hover:text-black">
                  <Github className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-black dark:border-white pt-12">
          <h2 className="text-3xl font-bold mb-6">Join Our Team</h2>
          <p className="text-lg text-gray-700 mb-6">
            We're always looking for talented researchers, engineers, and policy experts to join our mission. If you're
            passionate about using AI to improve policy-making, we'd love to hear from you.
          </p>
          <Link href="/contact" className="text-lg font-medium underline underline-offset-4 hover:text-gray-600">
            View open positions
          </Link>
        </div>
      </div>
    </div>
  )
}
