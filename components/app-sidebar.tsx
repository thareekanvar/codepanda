"use client";

import * as React from "react";
import Link from "next/link";
import { useApp } from "@/components/app-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { 
  Folder, 
  GitPullRequest, 
  Database,
  Code
} from "lucide-react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {
    activeTab,
    setActiveTab,
    repositories,
    selectedRepoId,
    setSelectedRepoId,
  } = useApp();

  return (
    <Sidebar {...props} className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 px-6 py-4 flex flex-row items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
          <Code className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight text-foreground">
          Workspace Explorer
        </span>
      </SidebarHeader>

      <SidebarContent>
        {/* Navigation Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "review" && !selectedRepoId}
                  render={
                    <Link href="/" onClick={() => {
                      setSelectedRepoId("");
                      setActiveTab("review");
                    }} />
                  }
                  className="w-full text-left"
                >
                  <GitPullRequest className="h-4 w-4" />
                  <span>Run PR Review</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === "analyze"}
                  render={
                    <Link href="/" onClick={() => {
                      setSelectedRepoId("");
                      setActiveTab("analyze");
                    }} />
                  }
                  className="w-full text-left"
                >
                  <Database className="h-4 w-4" />
                  <span>Setup Repository</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Repositories Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Analyzed Repositories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {repositories.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  No repositories yet.
                </div>
              ) : (
                repositories.map((repo) => (
                  <SidebarMenuItem key={repo.id}>
                    <SidebarMenuButton
                      isActive={selectedRepoId === repo.id}
                      render={
                        <Link href={`/repositories/${repo.id}`} onClick={() => setSelectedRepoId(repo.id)} />
                      }
                      className="w-full text-left justify-start gap-2"
                    >
                      <Folder className="h-4 w-4 shrink-0 text-muted-foreground group-data-[active=true]:text-primary" />
                      <span className="truncate max-w-[170px]">{repo.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
