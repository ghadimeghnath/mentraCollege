"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FacultyFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") || "";

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get("search") as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set("search", search);
    else params.delete("search");

    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    router.push(pathname);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Faculty</CardTitle>
        <CardDescription>Search faculty members by name, email, or employee ID.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleApply} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="space-y-2 w-full sm:w-2/3">
            <label htmlFor="search" className="text-sm font-medium">Search Query</label>
            <Input
              key={currentSearch}
              id="search"
              name="search"
              defaultValue={currentSearch}
              placeholder="e.g. John Doe, EMP001"
              className="flex h-10 w-full"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button type="submit">Search</Button>
            {currentSearch && (
              <Button type="button" variant="outline" onClick={handleClear}>
                Clear
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
