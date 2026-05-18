import Link from "next/link"

const navigation = {
  collection: [
    { name: "All Sets", href: "/collection?tab=sets" },
    { name: "Pokédex", href: "/collection?tab=pokedex" },
    { name: "Your Collection", href: "/collection?tab=profile" },
    { name: "Binders", href: "/collection?tab=profile" },
  ],
  gameplay: [
    { name: "Meta Decks", href: "/gameplay" },
    { name: "Tournaments", href: "/gameplay" },
    { name: "Deck Builder", href: "/decks/builder" },
    { name: "Rules", href: "/gameplay" },
  ],
  marketplace: [
    { name: "Browse Cards", href: "/marketplace" },
    { name: "Sell Cards", href: "/marketplace" },
    { name: "Price Guide", href: "/marketplace" },
    { name: "Sellers", href: "/marketplace" },
  ],
  company: [
    { name: "About", href: "/" },
    { name: "Blog", href: "/" },
    { name: "Contact", href: "/" },
    { name: "Privacy", href: "/" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-4">
            <Link href="/" className="font-serif text-2xl font-bold text-foreground">
              MintVault
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your ultimate companion for collecting, trading, and mastering the Pokémon Trading Card Game.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Collection</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.collection.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Gameplay</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.gameplay.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Marketplace</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.marketplace.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-10 md:mt-0">
                <h3 className="text-sm font-semibold text-foreground">Company</h3>
                <ul role="list" className="mt-4 space-y-3">
                  {navigation.company.map((item) => (
                    <li key={item.name}>
                      <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} MintVault. All rights reserved. Pokémon and Pokémon character names are trademarks of Nintendo.
          </p>
        </div>
      </div>
    </footer>
  )
}
