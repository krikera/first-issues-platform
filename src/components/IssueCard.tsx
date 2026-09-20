"use client";

import React from "react"
import { Star, Code, MessageSquare, GitPullRequest } from "lucide-react"

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
import type { BookmarkData } from "@/contexts/BookmarkContext"
import { formatRelativeTime } from "@/utils/dateUtils"
import { getDifficultyResult } from "@/utils/difficultyScorer"

import BookmarkButton from "./BookmarkButton"

interface IssueCardProps {
  issue: Issue
  showPullRequests?: boolean
  isBookmarked: boolean
  onToggleBookmark: (
    issueId: string,
    issueData?: BookmarkData
  ) => void
}

const getDifficultyBadge = (issue: Issue) => {
  if (issue.difficulty_score) {
    if (issue.difficulty_score <= 3.0) {
      return {
        label: "Easy",
        color: "bg-surface-2 text-semantic-success border-semantic-success/30",
        score: issue.difficulty_score,
      }
    } else if (issue.difficulty_score <= 6.0) {
      return {
        label: "Medium",
        color: "bg-surface-2 text-primary-hover border-primary/30",
        score: issue.difficulty_score,
      }
    } else {
      return {
        label: "Hard",
        color: "bg-surface-2 text-ink-muted border-hairline-strong",
        score: issue.difficulty_score,
      }
    }
  }

  const result = getDifficultyResult({
    labels: issue.labels,
    comments_count: issue.comments_count,
    created_at: issue.created_at,
    stars_count: issue.stars_count,
    is_assigned: issue.is_assigned,
    has_pull_requests: issue.has_pull_requests,
  })

  const colorMap = {
    green: "bg-surface-2 text-semantic-success border-semantic-success/30",
    yellow: "bg-surface-2 text-primary-hover border-primary/30",
    red: "bg-surface-2 text-ink-muted border-hairline-strong",
  }

  return {
    label: result.label,
    color: colorMap[result.color as keyof typeof colorMap] || "bg-surface-2 text-ink-muted border-hairline",
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
      <Code className="w-3.5 h-3.5 text-ink-subtle" />
    )

  const difficulty = getDifficultyBadge(issue)

  return (
    <article
      className="group relative rounded-[12px] border border-hairline bg-surface-1 p-5 transition-all duration-150 hover:bg-surface-2 hover:border-hairline-strong"
      itemScope
      itemType="https://schema.org/SoftwareSourceCode"
    >
      <div className="flex justify-between items-start gap-4 mb-3.5">
        <div className="space-y-1.5 flex-1 min-w-0">
          {/* Title */}
          <a
            href={issue.html_url}
            rel="noreferrer"
            target="_blank"
            className="block"
            aria-label={`View issue: ${issue.title} on GitHub`}
          >
            <h3
              className="font-display text-[16px] sm:text-[17px] font-medium text-ink leading-[1.35] tracking-[-0.3px] group-hover:text-primary-hover transition-colors line-clamp-2"
              itemProp="name"
            >
              {issue.title}
            </h3>
            <meta itemProp="url" content={issue.html_url} />
          </a>

          {/* Repository & Meta */}
          <div className="flex items-center gap-2 text-[13px] text-ink-subtle">
            <a
              href={issue.repository_url}
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink transition-colors font-medium truncate max-w-[220px]"
              itemProp="codeRepository"
            >
              {issue.repository_name}
            </a>
            <span className="text-hairline-strong">·</span>
            <span className="text-[12px] text-ink-tertiary">
              {formatRelativeTime(issue.created_at)}
            </span>
          </div>
        </div>

        {/* Bookmark Button */}
        <div className="flex-shrink-0">
          <BookmarkButton
            isBookmarked={isBookmarked}
            onClick={() =>
              onToggleBookmark(issue.id, {
                issue_id: issue.id,
                issue_url: issue.html_url,
                issue_title: issue.title,
                repository_name: issue.repository_name,
              })
            }
            aria-label={`${isBookmarked ? "Remove" : "Add"} bookmark`}
          />
        </div>
      </div>

      {/* Tags, Language & Stats */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-hairline/60">
        {/* Difficulty Badge */}
        <div
          className={`px-2 py-0.5 rounded-[4px] text-[11px] font-medium border uppercase tracking-[0.4px] ${difficulty.color}`}
        >
          {difficulty.label}
        </div>

        {/* Language */}
        {issue.language ? (
          <div className="flex items-center gap-1.5 text-[12px] text-ink-subtle border border-hairline bg-surface-2 px-2 py-0.5 rounded-[4px]">
            {LanguageIcon}
            <span>{issue.language}</span>
          </div>
        ) : null}

        {issue.has_pull_requests ? (
          <div className="flex items-center gap-1 text-[11px] text-ink-muted border border-hairline bg-surface-2 px-2 py-0.5 rounded-[4px]">
            <GitPullRequest className="w-3 h-3 text-primary-hover" />
            <span>
              {issue.pr_status === "DRAFT"
                ? "PR Draft"
                : issue.pr_status === "CLOSED"
                ? "PR Closed"
                : issue.pr_status === "OPEN"
                ? "PR Open"
                : "PR Linked"}
            </span>
          </div>
        ) : null}

        {/* Stats */}
        <div className="flex items-center gap-3 text-[12px] font-mono text-ink-tertiary ml-auto">
          <div className="flex items-center gap-1 hover:text-ink-subtle transition-colors">
            <Star className="w-3.5 h-3.5 text-hairline-strong group-hover:text-primary-focus transition-colors" />
            <span>{issue.stars_count}</span>
          </div>
          <div className="flex items-center gap-1 hover:text-ink-subtle transition-colors">
            <MessageSquare className="w-3.5 h-3.5 text-hairline-strong" />
            <span>{issue.comments_count}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
