"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories } from "@/data/categories";

interface FilterState {
  minStars: string;
  maxStars: string;
  minForks: string;
  language: string[];
  isAssigned: boolean;
  category: string;
  framework: string;
  hasPullRequests: boolean;
  showBookmarked: boolean;
  dateFrom: string;
  dateTo: string;
}

interface FilterPanelProps {
  filters: {
    minStars: string;
    maxStars: string;
    minForks: string;
    language: string;
    isAssigned: boolean;
    category: string;
    framework: string;
    hasPullRequests: boolean;
    showBookmarked: boolean;
    dateFrom: string;
    dateTo: string;
    searchQuery?: string;
  };
  onFilterChange: (filters: {
    minStars: string;
    maxStars: string;
    minForks: string;
    language: string[];
    isAssigned: boolean;
    category: string;
    framework: string;
    hasPullRequests: boolean;
    showBookmarked: boolean;
    dateFrom: string;
    dateTo: string;
    searchQuery: string;
  }) => void;
  setShowFilter: (show: boolean) => void;
}

export function FilterPanel({
  filters,
  onFilterChange,
  setShowFilter,
}: FilterPanelProps) {
  const [, startTransition] = useTransition();
  const [localFilters, setLocalFilters] = useState<FilterState>({
    ...filters,
    language: filters.language ? filters.language.split(" ").filter((l) => l) : [],
    dateFrom: filters.dateFrom || "",
    dateTo: filters.dateTo || "",
  });

  const [languageInput, setLanguageInput] = useState(filters.language || "");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "language") {
      setLanguageInput(value);
      startTransition(() => {
        setLocalFilters((prev) => ({
          ...prev,
          language: value.split(" ").filter((l) => l),
        }));
      });
    } else {
      startTransition(() => {
        setLocalFilters((prev) => ({ ...prev, [name]: value }));
      });
    }
  };

  const handleCheckboxChange = (name: string) => {
    startTransition(() => {
      setLocalFilters((prev) => ({
        ...prev,
        [name]: !prev[name as keyof FilterState],
      }));
    });
  };

  const handleCategoryChange = (value: string) => {
    startTransition(() => {
      setLocalFilters((prev) => ({ ...prev, category: value }));
    });
  };

  const handleApplyFilters = () => {
    startTransition(() => {
      let dateFrom = localFilters.dateFrom;
      let dateTo = localFilters.dateTo;
      if (dateFrom && dateTo && dateFrom > dateTo) {
        const temp = dateFrom;
        dateFrom = dateTo;
        dateTo = temp;
      }

      onFilterChange({
        ...localFilters,
        dateFrom,
        dateTo,
        language: localFilters.language,
        searchQuery: filters.searchQuery || "",
      });
      setShowFilter(false);
    });
  };

  return (
    <div className="max-h-[520px] overflow-y-auto text-ink">
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div>
            <h3 className="font-display text-[18px] font-semibold text-ink tracking-[-0.3px]">
              Advanced Filters
            </h3>
            <p className="text-[13px] text-ink-subtle mt-0.5">
              Refine issue discovery criteria
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowFilter(false)}
            aria-label="Close filters dialog"
            className="h-7 w-7 inline-flex items-center justify-center rounded-[6px] text-ink-subtle hover:text-ink hover:bg-surface-2 transition-colors cursor-pointer text-lg leading-none"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        {/* Stars Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="minStars"
              className="text-[12px] font-medium text-ink-muted"
            >
              Min Stars
            </Label>
            <Input
              type="number"
              id="minStars"
              name="minStars"
              value={localFilters.minStars}
              onChange={handleInputChange}
              min="0"
              placeholder="0"
              className="h-9 font-mono text-[13px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="maxStars"
              className="text-[12px] font-medium text-ink-muted"
            >
              Max Stars
            </Label>
            <Input
              type="number"
              id="maxStars"
              name="maxStars"
              value={localFilters.maxStars}
              onChange={handleInputChange}
              min="0"
              placeholder="100000"
              className="h-9 font-mono text-[13px]"
            />
          </div>
        </div>

        {/* Forks */}
        <div className="space-y-1.5">
          <Label
            htmlFor="minForks"
            className="text-[12px] font-medium text-ink-muted"
          >
            Min Forks
          </Label>
          <Input
            type="number"
            id="minForks"
            name="minForks"
            value={localFilters.minForks}
            onChange={handleInputChange}
            min="0"
            placeholder="0"
            className="h-9 font-mono text-[13px]"
          />
        </div>

        {/* Languages */}
        <div className="space-y-1.5">
          <Label
            htmlFor="language"
            className="text-[12px] font-medium text-ink-muted"
          >
            Languages (space separated)
          </Label>
          <Input
            type="text"
            id="language"
            name="language"
            value={languageInput}
            onChange={handleInputChange}
            placeholder="e.g. JavaScript Python Rust"
            className="h-9 font-mono text-[13px]"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label
            htmlFor="category"
            className="text-[12px] font-medium text-ink-muted"
          >
            Category
          </Label>
          <Select
            value={localFilters.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger
              id="category"
              className="h-9 bg-surface-1 border-hairline text-ink text-[13px]"
            >
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="bg-surface-2 border-hairline text-ink">
              {categories.map((cat) => (
                <SelectItem
                  key={cat.value}
                  value={cat.value}
                  className="text-[13px] text-ink focus:bg-surface-3 focus:text-ink cursor-pointer"
                >
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Framework */}
        <div className="space-y-1.5">
          <Label
            htmlFor="framework"
            className="text-[12px] font-medium text-ink-muted"
          >
            Framework or Topic
          </Label>
          <Input
            type="text"
            id="framework"
            name="framework"
            value={localFilters.framework}
            onChange={handleInputChange}
            placeholder="e.g. React, Vue, Next.js"
            className="h-9 text-[13px]"
          />
        </div>

        {/* Date Filter Section */}
        <div className="space-y-3 pt-2 border-t border-hairline">
          <div>
            <h4 className="text-[13px] font-medium text-ink">Date Created Range</h4>
            <p className="text-[12px] text-ink-subtle">
              Filter issues by original GitHub creation timestamp
            </p>
          </div>

          {/* Quick date range buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              className="text-[12px] font-mono px-2.5 py-1 rounded-[6px] bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-ink transition-colors cursor-pointer"
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date(
                  today.getTime() - 7 * 24 * 60 * 60 * 1000
                );
                setLocalFilters((prev) => ({
                  ...prev,
                  dateFrom: lastWeek.toISOString().split("T")[0]!,
                  dateTo: today.toISOString().split("T")[0]!,
                }));
              }}
            >
              Last 7 days
            </button>
            <button
              type="button"
              className="text-[12px] font-mono px-2.5 py-1 rounded-[6px] bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-muted hover:text-ink transition-colors cursor-pointer"
              onClick={() => {
                const today = new Date();
                const lastMonth = new Date(
                  today.getTime() - 30 * 24 * 60 * 60 * 1000
                );
                setLocalFilters((prev) => ({
                  ...prev,
                  dateFrom: lastMonth.toISOString().split("T")[0]!,
                  dateTo: today.toISOString().split("T")[0]!,
                }));
              }}
            >
              Last 30 days
            </button>
            <button
              type="button"
              className="text-[12px] font-mono px-2.5 py-1 rounded-[6px] bg-surface-2 hover:bg-surface-3 border border-hairline text-ink-subtle hover:text-ink transition-colors cursor-pointer"
              onClick={() => {
                setLocalFilters((prev) => ({
                  ...prev,
                  dateFrom: "",
                  dateTo: "",
                }));
              }}
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="dateFrom"
                className="text-[11px] font-mono uppercase text-ink-subtle"
              >
                From
              </Label>
              <Input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={localFilters.dateFrom || ""}
                onChange={handleInputChange}
                className="h-9 font-mono text-[12px]"
              />
            </div>
            <div>
              <Label
                htmlFor="dateTo"
                className="text-[11px] font-mono uppercase text-ink-subtle"
              >
                To
              </Label>
              <Input
                type="date"
                id="dateTo"
                name="dateTo"
                value={localFilters.dateTo || ""}
                onChange={handleInputChange}
                className="h-9 font-mono text-[12px]"
              />
            </div>
          </div>
          {localFilters.dateFrom || localFilters.dateTo ? (
            <div className="text-[12px] text-primary font-mono">
              {localFilters.dateFrom && localFilters.dateTo
                ? localFilters.dateFrom > localFilters.dateTo
                  ? `Notice: ${localFilters.dateFrom} > ${localFilters.dateTo} (will be auto-ordered)`
                  : `Active window: ${localFilters.dateFrom} to ${localFilters.dateTo}`
                : localFilters.dateFrom
                  ? `Active after ${localFilters.dateFrom}`
                  : `Active before ${localFilters.dateTo}`}
            </div>
          ) : null}
        </div>

        {/* Toggles */}
        <div className="space-y-2.5 pt-2 border-t border-hairline">
          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="isAssigned"
              checked={localFilters.isAssigned}
              onCheckedChange={() => handleCheckboxChange("isAssigned")}
            />
            <Label htmlFor="isAssigned" className="text-[13px] text-ink-muted cursor-pointer">
              Include Assigned Issues
            </Label>
          </div>
          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="hasPullRequests"
              checked={localFilters.hasPullRequests}
              onCheckedChange={() => handleCheckboxChange("hasPullRequests")}
            />
            <Label htmlFor="hasPullRequests" className="text-[13px] text-ink-muted cursor-pointer">
              Include Issues with Pull Requests
            </Label>
          </div>
          <div className="flex items-center space-x-2.5">
            <Checkbox
              id="showBookmarked"
              checked={localFilters.showBookmarked}
              onCheckedChange={() => handleCheckboxChange("showBookmarked")}
            />
            <Label htmlFor="showBookmarked" className="text-[13px] text-ink-muted cursor-pointer">
              Show Only Bookmarked Issues
            </Label>
          </div>
        </div>

        <div className="pt-4 border-t border-hairline">
          <Button
            onClick={handleApplyFilters}
            className="w-full h-10 font-medium text-[14px] cursor-pointer"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
