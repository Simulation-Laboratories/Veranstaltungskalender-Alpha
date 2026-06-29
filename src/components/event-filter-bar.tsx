"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const CATEGORIES = ["Party", "Kultur", "Sport", "Business", "Kinder", "Essen & Trinken"];

export function EventFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
    setSelectedCategory(searchParams.get("category") || "");
  }, [searchParams]);

  const applyFilters = (newQuery: string, newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newQuery) {
      params.set("q", newQuery);
    } else {
      params.delete("q");
    }

    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }

    router.push(`/?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters(query, selectedCategory);
  };

  const toggleCategory = (cat: string) => {
    const newCat = selectedCategory === cat ? "" : cat;
    setSelectedCategory(newCat);
    applyFilters(query, newCat);
  };

  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("");
    router.push("/");
  };

  const hasFilters = query !== "" || selectedCategory !== "";

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4 mb-8">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            type="text" 
            placeholder="Nach Events, Locations oder Veranstaltern suchen..." 
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit">Suchen</Button>
        {hasFilters && (
          <Button type="button" variant="ghost" size="icon" onClick={clearFilters} title="Filter zurücksetzen">
            <XIcon className="w-4 h-4" />
          </Button>
        )}
      </form>
      
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Button
            key={cat}
            type="button"
            variant={selectedCategory === cat ? "default" : "outline"}
            size="sm"
            onClick={() => toggleCategory(cat)}
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
}
