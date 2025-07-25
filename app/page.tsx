
import { AppFooter } from "@/components/app-footer"
import { AppHeader } from "@/components/app-header"
import { EmailBox } from "@/components/email-box"
import { PopularArticles } from "@/components/popular-articles"
import { WhySection } from "@/components/why-section"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"
import { DITMailPopup } from "@/components/DITMailPopup"
import Status from "@/components/Status"
import Script from "next/script"

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "FreeCustom.Email",
    "url": "https://www.freecustom.email",
    "logo": "https://www.freecustom.email/logo.webp",
    "description": "FreeCustom.Email is a privacy-first disposable email platform for testing, devs, and fast signups. No signup needed.",
    "sameAs": [
      "https://www.linkedin.com/company/freecustom-email",
      "https://github.com/DishantSinghDev/temp-mail",
      "https://www.producthunt.com/products/freecustom-email"
    ]
  }
  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen max-w-[100vw] bg-background">
          <AppHeader />
          <main className="mx-auto m-2 px-4 py-8">
            <section className="mb-12">
              <EmailBox />
              <Status />
              <h1
                className="mt-6 text-xl sm:text-2xl md:text-3xl font-semibold"
                suppressHydrationWarning
              >
                The Tech behind Disposable Temp Mail Address
              </h1>
              <p className="mb-4 text-muted-foreground">
                We all use email for various purposes, from connecting at work and with business prospects to communicating with friends. Yet, with the increase in online services requiring email addresses, spam and privacy concerns have grown. Freecustom.email helps protect your real email identity and keeps you safe from unwanted communications by offering a temporary, disposable email address.<br />
                <strong>This service is completely <Link className="text-blue-700 hover:underline" href={'/blog/forever-free-and-ad-free'}>free, ad-free, forever</Link> and the <Link className="text-blue-700 hover:underline" href={'/blog/why-we-are-fastest'} >fastest</Link> in the world in loadings.</strong>
              </p>
            </section>

            <WhySection />
            <PopularArticles />
          </main>
          <AppFooter />
          <DITMailPopup />
        </div>
      </ThemeProvider>
    </>
  )
}