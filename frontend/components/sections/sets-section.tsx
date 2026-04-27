import { Card, CardContent } from "@/components/ui/card"

const placeholderSets = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
]

export function SetsSection() {
  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-serif text-3xl font-bold text-foreground">Sets</h2>
          <p className="text-muted-foreground mt-1">Browse all Pokémon TCG sets</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {placeholderSets.map((set) => (
          <Card 
            key={set.id} 
            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card"
          >
            <CardContent className="p-4">
              <div className="aspect-square bg-muted rounded-lg mb-3 animate-pulse" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-muted-foreground text-sm">
          Sets will be loaded from the API. Each set will display an image, name, release date, and a button to view more details.
        </p>
      </div>
    </section>
  )
}
