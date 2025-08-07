"use client"

import { cn } from "@/lib/utils"
import { forwardRef } from "react"

// Glass Card Component
export const GlassCard = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("glass-card", className)}
        {...props}
    />
))
GlassCard.displayName = "GlassCard"

// Glass Panel Component
export const GlassPanel = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("glass-panel", className)}
        {...props}
    />
))
GlassPanel.displayName = "GlassPanel"

// Glass Button Component
export const GlassButton = forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn("glass-button", className)}
        {...props}
    />
))
GlassButton.displayName = "GlassButton"

// Glass Input Component
export const GlassInput = forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={cn("glass-input", className)}
        {...props}
    />
))
GlassInput.displayName = "GlassInput"

// Glass Badge Component
export const GlassBadge = forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        className={cn("glass-badge", className)}
        {...props}
    />
))
GlassBadge.displayName = "GlassBadge"

// Glass Container - for main content areas
export const GlassContainer = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "glass-panel p-8 max-w-7xl mx-auto",
            className
        )}
        {...props}
    />
))
GlassContainer.displayName = "GlassContainer"

// Glass Section - for page sections
export const GlassSection = forwardRef<
    HTMLElement,
    React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
    <section
        ref={ref}
        className={cn("glass-card mb-12", className)}
        {...props}
    />
))
GlassSection.displayName = "GlassSection"

// Glass Navigation Item
export const GlassNavItem = forwardRef<
    HTMLAnchorElement,
    React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => (
    <a
        ref={ref}
        className={cn(
            "glass-button text-foreground/70 hover:text-primary transition-all duration-200 font-medium",
            className
        )}
        {...props}
    />
))
GlassNavItem.displayName = "GlassNavItem"

// Glass Feature Card - for showcasing features
export const GlassFeatureCard = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        icon?: React.ReactNode
        title?: string
        description?: string
    }
>(({ className, icon, title, description, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("glass-card text-center group hover:scale-[1.02] transition-all duration-300", className)}
        {...props}
    >
        {icon && (
            <div className="w-12 h-12 mx-auto mb-4 glass-button rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                {icon}
            </div>
        )}
        {title && (
            <h3 className="font-heading text-xl font-semibold mb-3 group-hover:gradient-text transition-all duration-300">
                {title}
            </h3>
        )}
        {description && (
            <p className="text-muted-foreground leading-relaxed">
                {description}
            </p>
        )}
        {children}
    </div>
))
GlassFeatureCard.displayName = "GlassFeatureCard"

// Glass Hero Section
export const GlassHero = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        title?: string
        subtitle?: string
        description?: string
    }
>(({ className, title, subtitle, description, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("text-center mb-16", className)}
        {...props}
    >
        {subtitle && (
            <p className="uppercase font-heading text-sm text-primary/70 font-semibold tracking-wide mb-4">
                {subtitle}
            </p>
        )}
        {title && (
            <h1 className="font-heading text-5xl md:text-6xl font-bold mb-6 gradient-text">
                {title}
            </h1>
        )}
        {description && (
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                {description}
            </p>
        )}
        {children}
    </div>
))
GlassHero.displayName = "GlassHero"

// Glass Stats Component
export const GlassStats = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        stats: Array<{
            value: string
            label: string
            description?: string
        }>
    }
>(({ className, stats, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("grid grid-cols-1 md:grid-cols-3 gap-6", className)}
        {...props}
    >
        {stats.map((stat, index) => (
            <div key={index} className="glass-card text-center">
                <div className="text-3xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="font-heading font-semibold text-foreground mb-1">{stat.label}</div>
                {stat.description && (
                    <div className="text-sm text-muted-foreground">{stat.description}</div>
                )}
            </div>
        ))}
    </div>
))
GlassStats.displayName = "GlassStats"