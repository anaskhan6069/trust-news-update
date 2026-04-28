import Link from "next/link";
import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { navLinks, socialLinks } from "@/constants";

const socialIcons = [FaInstagram, FaFacebookF, FaLinkedinIn, FaXTwitter];

export function Footer(): JSX.Element {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-secondary/35">
      <div className="container grid gap-8 py-10 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
            <span className="text-brand-red">Trust</span>
            <span className="text-brand-black dark:text-white">News</span>
          </Link>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Independent community-powered news, reviewed before publication.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">Contact: 000000000</p>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-normal">Quick Links</h2>
          <div className="mt-4 grid gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-normal">Social</h2>
          <div className="mt-4 flex gap-3">
            {socialLinks.map((link, index) => {
              const Icon = socialIcons[index];

              return (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors hover:text-brand-red"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">Copyright © {year} Trust News. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
