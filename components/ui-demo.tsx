"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function UIDemo() {
    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="font-heading text-4xl font-bold mb-4 gradient-text">
                    Raycast-Style UI Components
                </h1>
                <p className="text-muted-foreground text-lg">
                    Beautiful glassmorphism components with perfect opacity and styling
                </p>
            </div>

            {/* Button Variants */}
            <Card className="p-6">
                <CardHeader>
                    <CardTitle>Button Components</CardTitle>
                    <CardDescription>
                        Glass buttons with perfect bg-white/10 hover:bg-white/20 styling
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <Button variant="glass" size="default">
                            Glass Button
                        </Button>
                        <Button variant="glass" size="sm">
                            Small Glass
                        </Button>
                        <Button variant="glass" size="lg">
                            Large Glass
                        </Button>
                        <Button variant="default" size="default">
                            Gradient Primary
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Button variant="outline">Outline</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="link">Link Button</Button>
                    </div>
                </CardContent>
            </Card>

            {/* Badge Variants */}
            <Card className="p-6">
                <CardHeader>
                    <CardTitle>Badge Components</CardTitle>
                    <CardDescription>
                        Glass badges with subtle transparency and indigo theming
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="glass">Glass Badge</Badge>
                        <Badge variant="default">Primary Badge</Badge>
                        <Badge variant="secondary">Secondary</Badge>
                        <Badge variant="destructive">Destructive</Badge>
                        <Badge variant="outline">Outline</Badge>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Badge variant="glass">Research</Badge>
                        <Badge variant="glass">Case Study</Badge>
                        <Badge variant="glass">Opinion</Badge>
                        <Badge variant="glass">Analysis</Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Card Examples */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Glass Card Example</CardTitle>
                        <CardDescription>
                            Perfect glassmorphism with hover effects
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            This card uses the exact styling you wanted: bg-white/10 with backdrop-blur-sm
                            and border-white/20 for that perfect Raycast aesthetic.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="glass" size="sm">Action</Button>
                            <Badge variant="glass">Featured</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Policy Analysis</CardTitle>
                        <CardDescription>
                            Agent-based modeling for complex systems
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Explore how AI can help policymakers understand complex scenarios
                            and simulate interventions before implementation.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="default" size="sm">Explore</Button>
                            <Badge variant="default">AI Tools</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Interactive Demo */}
            <Card className="p-6">
                <CardHeader>
                    <CardTitle>Interactive Demo</CardTitle>
                    <CardDescription>
                        Try hovering over these components to see the beautiful transitions
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center space-y-3">
                            <h4 className="font-semibold">Glass Buttons</h4>
                            <Button variant="glass" className="w-full">
                                Hover Me
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                bg-white/10 → bg-white/20
                            </p>
                        </div>

                        <div className="text-center space-y-3">
                            <h4 className="font-semibold">Glass Badges</h4>
                            <div className="flex justify-center">
                                <Badge variant="glass">Hover Badge</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Subtle hover effects
                            </p>
                        </div>

                        <div className="text-center space-y-3">
                            <h4 className="font-semibold">Glass Cards</h4>
                            <div className="text-xs text-muted-foreground">
                                This entire card has hover effects
                            </div>
                            <p className="text-xs text-muted-foreground">
                                scale-[1.02] on hover
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}