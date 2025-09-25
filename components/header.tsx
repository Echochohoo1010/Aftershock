"use client";

import * as React from "react";
import Link from "next/link";
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation";

const tools: { title: string; href: string; description: string }[] = [
  {
    title: "Canvas",
    href: "/canvas",
    description: "Visual policy modeling and scenario planning canvas.",
  },
  {
    title: "Policy Bench",
    href: "/policy-bench",
    description: "Benchmark and analyze policy performance metrics.",
  },
  {
    title: "Supply Chain",
    href: "/supply",
    description: "Analyze supply chain impacts of policy decisions.",
  },
  {
    title: "Story",
    href: "/story",
    description: "Create and visualize policy scenarios with causal modeling.",
  },
];

export default function Header() {
  return (
    <header className="w-full justify-around   mx-auto border-b max-w-6xl">
      <NavigationMenu viewport={false} className="w-full z-50  ">
        <NavigationMenuList className="  flex mx-auto items-center justify-between">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/" className="flex items-center ">
                <img
                  src="/explore-logo.png"
                  alt="Exploratory Policy"
                  className="h-8 w-8 rounded-full"
                />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <div className="flex justify-around items-center space-x-4">
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {" "}
                <span className="font-semibold">Explore Policy</span>
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-2">
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/about">
                        <div className="font-medium">About Us</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/team">
                        <div className="font-medium">Team</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/research">
                        <div className="font-medium">Research</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/blog">
                        <div className="font-medium">Blog</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink asChild>
                      <Link href="/contact">
                        <div className="font-medium">Contact</div>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger>Product</NavigationMenuTrigger>

              <NavigationMenuContent>
                <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <Link
                        className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b from:bg-primary to:bg-secondary p-6 no-underline outline-hidden select-none focus:shadow-md"
                        href="/"
                      >
                        <div className="mt-4 mb-2 text-lg font-medium">
                          Policy Exploration
                        </div>
                        <p className="text-muted-foreground text-sm leading-tight">
                          AI-powered tools for policy formulation and causal
                          analysis.
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/explore" title="Policy Explorer">
                    Explore different policy options and their economic impacts.
                  </ListItem>
                  <ListItem href="/agent" title="AI Agents">
                    Interact with specialized AI agents for policy analysis.
                  </ListItem>
                </ul>

                {/* underline the text */}
                <div className="border-b border-gray-200 my-4"></div>

                <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {tools.map((tool) => (
                    <ListItem
                      key={tool.title}
                      title={tool.title}
                      href={tool.href}
                    >
                      {tool.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              {/* <NavigationMenuTrigger> */}
              <Link href="/canvas">
                <Button variant="outline">Canvas</Button>
              </Link>
              {/* </NavigationMenuTrigger> */}
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link href="/explore">
                <Button variant="default">Explore </Button>
              </Link>
            </NavigationMenuItem>
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
