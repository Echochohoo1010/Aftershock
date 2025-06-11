import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function Contact() {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-12">Contact Us</h1>

        <div className="grid md:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-lg text-gray-700 mb-6">
              We're interested in collaborations with researchers, policymakers, and organizations working on complex
              policy challenges. Reach out to discuss how we might work together.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <h3 className="text-xl font-bold">Email</h3>
                <p className="text-gray-700">info@exploratorypolicy.org</p>
              </div>
              <div>
                <h3 className="text-xl font-bold">Location</h3>
                <p className="text-gray-700">San Francisco, CA</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold">Follow Us</h3>
              <div className="flex space-x-6">
                <a href="#" className="text-gray-600 hover:text-black">
                  Twitter
                </a>
                <a href="#" className="text-gray-600 hover:text-black">
                  LinkedIn
                </a>
                <a href="#" className="text-gray-600 hover:text-black">
                  GitHub
                </a>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Send a Message</h2>
            <form className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-lg font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="border-black dark:border-gray-600 dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-lg font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  className="border-black dark:border-gray-600 dark:bg-gray-800"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-lg font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Your message"
                  className="border-black dark:border-gray-600 dark:bg-gray-800 min-h-[150px]"
                />
              </div>

              <Button
                type="submit"
                className="text-lg px-6 py-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 w-full"
              >
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
