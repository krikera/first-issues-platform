"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { defaultFilters } from "@/data/defaults";
import { sanitizeSearchInput } from "@/utils/clientValidation";

export interface IssueFilters {
  minStars: string;
  maxStars: string;
  minForks: string;
  language: string[];
  isAssigned: boolean;
  category: string;
  framework: string;
  hasPullRequests: boolean;
  showBookmarked: boolean;
  searchQuery: string;
  dateFrom: string;
  dateTo: string;
}

export function useIssueFilters() {
  const [minStars, setMinStars] = useState(defaultFilters.minStars.toString());
  const [maxStars, setMaxStars] = useState(defaultFilters.maxStars.toString());
  const [minForks, setMinForks] = useState(defaultFilters.minForks.toString());
  const [language, setLanguage] = useState<string[]>(defaultFilters.language);
  const [isAssigned, setIsAssigned] = useState(defaultFilters.isAssigned);
  const [category, setCategory] = useState(defaultFilters.category);
  const [framework, setFramework] = useState(defaultFilters.framework);
  const [hasPullRequests, setHasPullRequests] = useState(defaultFilters.hasPullRequests);
  const [showBookmarked, setShowBookmarked] = useState(defaultFilters.showBookmarked);
  const [searchQuery, setSearchQuery] = useState(defaultFilters.searchQuery);
  const [dateFrom, setDateFrom] = useState(defaultFilters.dateFrom);
  const [dateTo, setDateTo] = useState(defaultFilters.dateTo);
  const [isSearching, setIsSearching] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Read initial values from URL search params
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setMinStars(searchParams.get("minStars") || defaultFilters.minStars.toString());
      setMaxStars(searchParams.get("maxStars") || defaultFilters.maxStars.toString());
      setMinForks(searchParams.get("minForks") || defaultFilters.minForks.toString());
      const langParam = searchParams.get("language");
      setLanguage(langParam ? langParam.split(" ") : defaultFilters.language);
      const isAssignedParam = searchParams.get("isAssigned");
      setIsAssigned(isAssignedParam !== null ? isAssignedParam === "true" : defaultFilters.isAssigned);
      setCategory(searchParams.get("category") || defaultFilters.category);
      setFramework(searchParams.get("framework") || defaultFilters.framework);
      const hasPrParam = searchParams.get("hasPullRequests");
      setHasPullRequests(hasPrParam !== null ? hasPrParam === "true" : defaultFilters.hasPullRequests);
      const showBookmarkedParam = searchParams.get("showBookmarked");
      setShowBookmarked(showBookmarkedParam !== null ? showBookmarkedParam === "true" : defaultFilters.showBookmarked);
      setDateFrom(searchParams.get("dateFrom") || defaultFilters.dateFrom);
      setDateTo(searchParams.get("dateTo") || defaultFilters.dateTo);
      setSearchQuery(searchParams.get("searchQuery") || defaultFilters.searchQuery);
    } catch (error) {
      console.error("Error reading URL parameters:", error);
    }
  }, [searchParams]);

  const submitFilters = useCallback(
    (updatedFilters: Record<string, string>) => {
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        const typedKey = key as keyof typeof defaultFilters;
        if (key === "language") {
          const defaultLanguageValue = (defaultFilters[typedKey] as string[]).join(" ");
          if (value !== defaultLanguageValue) params.set(key, value);
        } else if (value !== defaultFilters[typedKey].toString()) {
          params.set(key, value);
        }
      });
      setIsSearching(true);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedSearchQuery = sanitizeSearchInput(searchQuery);
    submitFilters({
      minStars, maxStars, minForks,
      searchQuery: sanitizedSearchQuery,
      category, framework,
      hasPullRequests: hasPullRequests.toString(),
      showBookmarked: showBookmarked.toString(),
      isAssigned: isAssigned.toString(),
      language: language.join(" "),
      dateFrom, dateTo,
    });
  };

  const handleFilterChange = (newFilters: Partial<IssueFilters>) => {
    if (newFilters.minStars !== undefined) setMinStars(newFilters.minStars.toString());
    if (newFilters.maxStars !== undefined) setMaxStars(newFilters.maxStars.toString());
    if (newFilters.minForks !== undefined) setMinForks(newFilters.minForks.toString());
    if (newFilters.language !== undefined) setLanguage(newFilters.language);
    if (newFilters.category !== undefined) setCategory(newFilters.category);
    if (newFilters.framework !== undefined) setFramework(newFilters.framework);
    if (newFilters.isAssigned !== undefined) setIsAssigned(newFilters.isAssigned);
    if (newFilters.hasPullRequests !== undefined) setHasPullRequests(newFilters.hasPullRequests);
    if (newFilters.showBookmarked !== undefined) setShowBookmarked(newFilters.showBookmarked);
    if (newFilters.dateFrom !== undefined) setDateFrom(newFilters.dateFrom);
    if (newFilters.dateTo !== undefined) setDateTo(newFilters.dateTo);
    if (newFilters.searchQuery !== undefined) setSearchQuery(newFilters.searchQuery);

    const updatedFilters = {
      minStars: newFilters.minStars !== undefined ? newFilters.minStars : minStars,
      maxStars: newFilters.maxStars !== undefined ? newFilters.maxStars : maxStars,
      minForks: newFilters.minForks !== undefined ? newFilters.minForks : minForks,
      category: newFilters.category !== undefined ? newFilters.category : category,
      framework: newFilters.framework !== undefined ? newFilters.framework : framework,
      hasPullRequests: (newFilters.hasPullRequests !== undefined ? newFilters.hasPullRequests : hasPullRequests).toString(),
      showBookmarked: (newFilters.showBookmarked !== undefined ? newFilters.showBookmarked : showBookmarked).toString(),
      isAssigned: (newFilters.isAssigned !== undefined ? newFilters.isAssigned : isAssigned).toString(),
      language: (newFilters.language !== undefined ? newFilters.language : language).join(" "),
      dateFrom: newFilters.dateFrom !== undefined ? newFilters.dateFrom : dateFrom,
      dateTo: newFilters.dateTo !== undefined ? newFilters.dateTo : dateTo,
      searchQuery: newFilters.searchQuery !== undefined ? newFilters.searchQuery : searchQuery,
    };

    setIsSearching(true);
    submitFilters(updatedFilters);
  };

  return {
    filters: {
      minStars, maxStars, minForks, language, isAssigned, category,
      framework, hasPullRequests, showBookmarked, searchQuery, dateFrom, dateTo,
    },
    setMinStars, setMaxStars, setMinForks, setLanguage, setIsAssigned,
    setCategory, setFramework, setHasPullRequests, setShowBookmarked,
    setSearchQuery, setDateFrom, setDateTo,
    isSearching, setIsSearching,
    handleSearch, handleFilterChange,
  };
}
