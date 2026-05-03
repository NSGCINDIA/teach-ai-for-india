import Link from "next/link"
import Image from "next/image"

const links = [
  { label: "Impact",    href: "/#impact" },
  { label: "Program",   href: "/#program" },
  { label: "Campuses",  href: "/#campuses" },
  { label: "Login",     href: "/login" },
  { label: "Privacy",   href: "#" },
  { label: "Contact",   href: "#" },
]

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-1.5">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India"
              width={120}
              height={44}
              className="object-contain"
            />
            <p className="text-xs text-muted-foreground">Built by NIAT Students</p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Teach AI For India. All rights reserved.
          </p>
          {/* India tricolour dots */}
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FF9933" }} />
            <span className="w-2 h-2 rounded-full bg-white border border-border" />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#138808" }} />
          </div>
        </div>
      </div>
    </footer>
  )
}
