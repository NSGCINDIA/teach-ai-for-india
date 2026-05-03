import Link from "next/link"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Teach_Ai_1_page-0001-removebg-preview-ZJzf3R1J38t7BLntCYEUuQMl2LbJdV.png"
              alt="Teach AI For India — NIAT Student General Council"
              width={130}
              height={50}
              className="object-contain"
            />
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap justify-center">
            <Link href="/#impact" className="hover:text-foreground transition-colors">Impact</Link>
            <Link href="/#program" className="hover:text-foreground transition-colors">Program</Link>
            <Link href="/#campuses" className="hover:text-foreground transition-colors">Campuses</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Teach AI For India. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#FF9933" }} />
            <span className="w-2 h-2 rounded-full bg-white border border-border" />
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#138808" }} />
          </div>
        </div>
      </div>
    </footer>
  )
}
