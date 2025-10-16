import { RiArrowRightUpLine } from "@remixicon/react"
import Link from "next/link"

const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
    <path d="M9 2L10.5 7L15 8.5L10.5 10L9 15L7.5 10L3 8.5L7.5 7L9 2Z" />
    <path d="M15 11L16 14L19 15L16 16L15 19L14 16L11 15L14 14L15 11Z" />
    <path d="M6 16L7 18L9 19L7 20L6 22L5 20L3 19L5 18L6 16Z" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
  </svg>
)

const navigation = {
  product: [
    { name: "Platform", href: "#", external: false },
    { name: "Pricing", href: "/pricing", external: false },
    { name: "Docs", href: "#", external: false },
    { name: "Changelog", href: "/changelog", external: false },
  ],
  resources: [
    { name: "FAQs", href: "/pricing#faq-title", external: false },
    { name: "GitHub", href: "#", external: true },
  ],
  company: [
    { name: "About Us", href: "/about", external: false },
    { name: "Contact", href: "#", external: false },
    { name: "Status", href: "#", external: false },
  ],
  legal: [
    { name: "Privacy Policy", href: "#", external: false },
    { name: "Terms of Service", href: "#", external: false },
  ],
}

export default function Footer() {
  return (
    <footer id="footer">
      <div className="mx-auto max-w-6xl px-3 pb-8 pt-16 sm:pt-24 lg:pt-32">
        <div className="xl:grid xl:grid-cols-3 xl:gap-20">
          <div className="space-y-8">
            {/* Logo + Nexa text, clickable */}
            <Link href="/" className="flex items-center space-x-3">
              <Logo className="w-10 h-10 text-indigo-600" />
              <span className="text-xl font-medium tracking-tight text-gray-50">
                Nexa
              </span>
            </Link>

            <p className="text-sm leading-6 text-gray-400">
              Powering innovation from concept to execution. Built for teams 
              that want to move faster, smarter, and together.
            </p>
          </div>

          {/* Navigation links */}
          <div className="mt-16 grid grid-cols-1 gap-14 sm:gap-8 md:grid-cols-2 xl:col-span-2 xl:mt-0">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-medium leading-6 text-gray-50">
                  Product
                </h3>
                <ul
                  role="list"
                  className="mt-6 space-y-4"
                  aria-label="Quick links Product"
                >
                  {navigation.product.map((item) => (
                    <li key={item.name} className="w-fit">
                      <Link
                        className="flex rounded-md text-sm text-gray-400 transition hover:text-gray-50"
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                      >
                        <span>{item.name}</span>
                        {item.external && (
                          <div className="ml-1 aspect-square size-3 rounded-full bg-gray-800 p-px">
                            <RiArrowRightUpLine
                              aria-hidden="true"
                              className="size-full shrink-0 text-gray-300"
                            />
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-50">
                  Resources
                </h3>
                <ul
                  role="list"
                  className="mt-6 space-y-4"
                  aria-label="Quick links Resources"
                >
                  {navigation.resources.map((item) => (
                    <li key={item.name} className="w-fit">
                      <Link
                        className="flex rounded-md text-sm text-gray-400 transition hover:text-gray-50"
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                      >
                        <span>{item.name}</span>
                        {item.external && (
                          <div className="ml-0.5 aspect-square size-3 rounded-full bg-gray-800 p-px">
                            <RiArrowRightUpLine
                              aria-hidden="true"
                              className="size-full shrink-0 text-gray-300"
                            />
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-50">
                  Platform
                </h3>
                <ul
                  role="list"
                  className="mt-6 space-y-4"
                  aria-label="Quick links Company"
                >
                  {navigation.company.map((item) => (
                    <li key={item.name} className="w-fit">
                      <Link
                        className="flex rounded-md text-sm text-gray-400 transition hover:text-gray-50"
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                      >
                        <span>{item.name}</span>
                        {item.external && (
                          <div className="ml-1 aspect-square size-3 rounded-full bg-gray-800 p-px">
                            <RiArrowRightUpLine
                              aria-hidden="true"
                              className="size-full shrink-0 text-gray-300"
                            />
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-6 text-gray-50">
                  Legal
                </h3>
                <ul
                  role="list"
                  className="mt-6 space-y-4"
                  aria-label="Quick links Legal"
                >
                  {navigation.legal.map((item) => (
                    <li key={item.name} className="w-fit">
                      <Link
                        className="flex rounded-md text-sm text-gray-400 transition hover:text-gray-50"
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                      >
                        <span>{item.name}</span>
                        {item.external && (
                          <div className="ml-1 aspect-square size-3 rounded-full bg-gray-800 p-px">
                            <RiArrowRightUpLine
                              aria-hidden="true"
                              className="size-full shrink-0 text-gray-300"
                            />
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer section */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 sm:mt-20 sm:flex-row lg:mt-24">
          <p className="text-sm leading-5 text-gray-400">
            &copy; {new Date().getFullYear()} Nexa. All rights reserved.
          </p>
          <div className="rounded-full border border-gray-800 py-1 pl-1 pr-2">
            <div className="flex items-center gap-1.5">
              <div className="relative size-4 shrink-0">
                <div className="absolute inset-[1px] rounded-full bg-emerald-600/20" />
                <div className="absolute inset-1 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-gray-50">
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
