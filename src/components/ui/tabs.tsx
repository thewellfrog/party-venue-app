import * as React from "react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
}

function Tabs({ tabs, activeTab, onTabChange, className }: TabsProps) {
  return (
    <div className={cn("bg-white border-b", className)}>
      <div className="flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

interface TabPanelProps {
  value: string
  activeTab: string
  children: React.ReactNode
  className?: string
}

function TabPanel({ value, activeTab, children, className }: TabPanelProps) {
  if (value !== activeTab) return null
  
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  )
}

export { Tabs, TabPanel }