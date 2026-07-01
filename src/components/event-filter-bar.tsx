"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon, LayoutGridIcon, ListIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const CATEGORIES = ["Party", "Kultur", "Sport", "Business", "Kinder", "Essen & Trinken"];

export function EventFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const urlQuery = searchParams.get("q") || "";
  const urlCategory = searchParams.get("category") || "";
  
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [prevUrlCategory, setPrevUrlCategory] = useState(urlCategory);
  
  const currentView = searchParams.get("view") || "grid";

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  if (urlCategory !== prevUrlCategory) {
    setPrevUrlCategory(urlCategory);
    setSelectedCategory(urlCategory);
  }

  const applyFilters = (newQuery: string, newCategory: string, newView: string = currentView) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newQuery) params.set("q", newQuery);
    else params.delete("q");

    if (newCategory) params.set("category", newCategory);
    else params.delete("category");

    if (newView && newView !== "grid") params.set("view", newView);
    else params.delete("view");

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
    // Keep view preference when clearing filters
    const params = new URLSearchParams();
    if (currentView !== "grid") params.set("view", currentView);
    router.push(`/?${params.toString()}`);
  };

  const hasFilters = query !== "" || selectedCategory !== "";

  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm space-y-4 mb-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              type="search" 
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

        <div className="flex items-center gap-1 bg-muted p-1 rounded-lg shrink-0">
          <Button 
            type="button" 
            variant={currentView === "grid" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => applyFilters(query, selectedCategory, "grid")}
            className="px-3"
          >
            <LayoutGridIcon className="w-4 h-4 mr-2" />
            Kacheln
          </Button>
          <Button 
            type="button" 
            variant={currentView === "list" ? "secondary" : "ghost"} 
            size="sm"
            onClick={() => applyFilters(query, selectedCategory, "list")}
            className="px-3"
          >
            <ListIcon className="w-4 h-4 mr-2" />
            Liste
          </Button>
        </div>
      </div>
      
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
