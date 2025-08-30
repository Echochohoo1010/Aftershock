'use client';

import React from 'react';
import { ScenarioPlanningCanvas } from '@/components/scenario-planning-canvas';

export default function ScenarioPlanningPage() {
    return (
        <div className="h-screen w-full">
            <div className="flex flex-col h-full">
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center">
                        <h1 className="text-lg font-semibold">Scenario Planning Canvas</h1>
                        <div className="ml-auto flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                                Strategic Foresight & Analysis
                            </span>
                        </div>
                    </div>
                </header>
                <main className="flex-1">
                    <ScenarioPlanningCanvas />
                </main>
            </div>
        </div>
    );
}