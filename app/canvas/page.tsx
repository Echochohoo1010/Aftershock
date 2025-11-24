'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AnalysisCanvas from '@/components/core/AnalysisCanvas';
import { CaseId } from '@/components/explore/content/types';

function CanvasContent() {
    const searchParams = useSearchParams();
    const [caseId, setCaseId] = useState<CaseId | null>(null);

    useEffect(() => {
        const caseParam = searchParams.get('case') as CaseId;
        if (caseParam === 'carbon-tax' || caseParam === 'fiscal-stimulus') {
            setCaseId(caseParam);
        }
    }, [searchParams]);

    if (!caseId) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">No case study selected</h2>
                    <p className="text-gray-600">Please select a case study from the explore page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-full">
            <AnalysisCanvas selectedCase={caseId} />
        </div>
    );
}

export default function ScenarioPlanningPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
                <div className="animate-pulse text-gray-600">Loading simulation...</div>
            </div>
        }>
            <CanvasContent />
        </Suspense>
    );
}
