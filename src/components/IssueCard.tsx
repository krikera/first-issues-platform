"use client";

import React from "react"
import { Star, Code, MessageSquare } from "lucide-react"

import {
  ReactIcon,
  NodeJsIcon,
  VueJsIcon,
  TypeScriptIcon,
  DockerIcon,
  PythonIcon,
  JavaIcon,
  PhpIcon,
  AwsIcon,
  FlutterIcon,
  MdxIcon,
  AngularIcon,
  GoIcon,
  CSharpIcon,
  SwiftIcon,
  KotlinIcon,
  ScalaIcon,
  RubyIcon,
  RustIcon,
  CplusplusIcon,
  CIcon,
  ElixirIcon,
  HaskellIcon,
  DartIcon,
} from "@/components/icons"
import { Issue } from "@/types"
import { formatRelativeTime } from "@/utils/dateUtils"
import { getDifficultyResult } from "@/utils/difficultyScorer"

import BookmarkButton from "./BookmarkButton"

interface IssueCardProps {
  issue: Issue
  showPullRequests?: boolean
  isBookmarked: boolean
  onToggleBookmark: (issueId: string) => void
}

// Helper function to get difficulty badge styling
const getDifficultyBadge = (issue: Issue) => {
  // If we already have difficulty from backend, use it
  if (issue.difficulty_score) {
    if (issue.difficulty_score <= 3.0) {
      return {
        emoji: "🟢",
        label: "Easy",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        score: issue.difficulty_score,
      }
    } else if (issue.difficulty_score <= 6.0) {
      return {
        emoji: "🟡",
        label: "Medium",
        color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        score: issue.difficulty_score,
      }
    } else {
      return {
        emoji: "🔴",
        label: "Hard",
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        score: issue.difficulty_score,
      }
    }
  }

  // Otherwise, calculate on the fly
  const result = getDifficultyResult({
    labels: issue.labels,
    comments_count: issue.comments_count,
    created_at: issue.created_at,
    stars_count: issue.stars_count,
    is_assigned: issue.is_assigned,
    has_pull_requests: issue.has_pull_requests,
  })

  const colorMap = {
    green: "bg-green-500/20 text-green-400 border-green-500/30",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30",
  }

  return {
    emoji: result.emoji,
    label: result.label,
    color: colorMap[result.color as keyof typeof colorMap],
    score: result.score,
  }
}

const languageIcons: { [key: string]: React.ReactNode } = {
  JavaScript: <NodeJsIcon />,
  TypeScript: <TypeScriptIcon />,
  Python: <PythonIcon />,
  Java: <JavaIcon />,
  PHP: <PhpIcon />,
  React: <ReactIcon />,
  Vue: <VueJsIcon />,
  Angular: <AngularIcon />,
  Flutter: <FlutterIcon />,
  MDX: <MdxIcon />,
  Docker: <DockerIcon />,
  AWS: <AwsIcon />,
  Go: <GoIcon />,
  "C#": <CSharpIcon />,
  Swift: <SwiftIcon />,
  Kotlin: <KotlinIcon />,
  Scala: <ScalaIcon />,
  Ruby: <RubyIcon />,
  Rust: <RustIcon />,
  "C++": <CplusplusIcon />,
  C: <CIcon />,
  Elixir: <ElixirIcon />,
  Haskell: <HaskellIcon />,
  Dart: <DartIcon />,
}

export function IssueCard({
  issue,
  isBookmarked,
  onToggleBookmark,
}: IssueCardProps) {
  const LanguageIcon =
    issue.language && languageIcons[issue.language] ? (
      languageIcons[issue.language]
    ) : (
      <Code className="w-4 h-4" />
    )

  const difficulty = getDifficultyBadge(issue)

  return (
    <article
      className="relative bg-card/50 border border-border/50 rounded-lg overflow-hidden hover:border-primary/50 transition-colors duration-200"
      itemScope
      itemType="https://schema.org/SoftwareSourceCode"
    >
      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-3">
          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Title */}
            <a
              href={issue.html_url}
              rel="noreferrer"
              target="_blank"
              className="block group"
              aria-label={`View issue: ${issue.title} on GitHub`}
            >
              <h3
                className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight"
                itemProp="name"
              >
                {issue.title}
              </h3>
              <meta itemProp="url" content={issue.html_url} />
            </a>

            {/* Repository */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <a
                href={issue.repository_url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors truncate max-w-[200px]"
                itemProp="codeRepository"
              >
                {issue.repository_name}
              </a>
              <span>•</span>
              <span className="text-xs">
                {formatRelativeTime(issue.created_at)}
              </span>
            </div>
          </div>

          {/* Bookmark Button */}
          <div className="flex-shrink-0 -mt-1 -mr-1">
            <BookmarkButton
              isBookmarked={isBookmarked}
              onClick={() => onToggleBookmark(issue.id)}
              aria-label={`${isBookmarked ? "Remove" : "Add"} bookmark`}
            />
          </div>
        </div>

        {/* Stats & Tags */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          {/* Difficulty Badge */}
          <div
            className={`px-2 py-0.5 rounded text-xs font-medium border ${difficulty.color}`}
          >
            {difficulty.label}
          </div>

          {/* Language */}
          {issue.language ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border px-2 py-0.5 rounded">
              {LanguageIcon}
              <span>{issue.language}</span>
            </div>
          ) : null}

          {/* Stats */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5" />
              <span>{issue.stars_count}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{issue.comments_count}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
