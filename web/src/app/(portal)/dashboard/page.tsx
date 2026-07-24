"use client";

import { useEffect, useState } from "react";
import { MetricTile } from "@/components/ui/MetricTile";
import { SectionCard } from "@/components/ui/SectionCard";
import { api, type BiometricPolicySummary, type ReportsAnalytics } from "@/lib/api";

function asCount(value: number): string {
    return value.toString().padStart(2, "0");
}

export default function DashboardPage() {
    const [analytics, setAnalytics] = useState<ReportsAnalytics | null>(null);
    const [policy, setPolicy] = useState<BiometricPolicySummary | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadDashboardData() {
            try {
                const [analyticsPayload, policyPayload] = await Promise.all([
                    api.getReportsAnalytics(),
                    api.getDefaultBiometricPolicy(),
                ]);

                if (!isMounted) {
                    return;
                }

                setAnalytics(analyticsPayload);
                setPolicy(policyPayload);
            } catch {
                if (!isMounted) {
                    return;
                }

                // Keep dashboard renderable when backend services are unavailable.
                setAnalytics(null);
                setPolicy(null);
            }
        }

        loadDashboardData().catch(() => {
            // The fetch logic already handles errors and fallback state.
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const totalAttempts = analytics
        ? analytics.byStatus.reduce((sum, item) => sum + item.count, 0)
        : 0;
    const highRisk = analytics
        ? analytics.byRisk
            .filter((item) => item.riskLevel.toLowerCase() === "high")
            .reduce((sum, item) => sum + item.count, 0)
        : 0;
    const denied = analytics
        ? analytics.byDecision
            .filter((item) => item.decision.toLowerCase() === "deny")
            .reduce((sum, item) => sum + item.count, 0)
        : 0;

    const metrics = [
        {
            label: "Total Attempts",
            value: asCount(totalAttempts),
            trend: analytics ? "live from /api/reports/analytics" : "backend offline",
            tone: "brand" as const,
        },
        {
            label: "High Risk Events",
            value: asCount(highRisk),
            trend: analytics ? "risk distribution" : "backend offline",
            tone: "accent" as const,
        },
        {
            label: "Denied Decisions",
            value: asCount(denied),
            trend: analytics ? "decision distribution" : "backend offline",
            tone: "danger" as const,
        },
        {
            label: "Default Threshold",
            value: policy ? policy.defaultThreshold.toFixed(2) : "N/A",
            trend: policy ? `${policy.policy} policy` : "backend offline",
            tone: "neutral" as const,
        },
    ];

    return (
        <div className="space-y-5">
            <header className="panel p-6">
                <p className="mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    Phase 7 Step 1
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight">AMBS Command Dashboard</h1>
                <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
                    Centralized operational surface for adaptive biometric fusion, risk-aware verification, and policy
                    governance.
                </p>
            </header>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {metrics.map((metric) => (
                    <MetricTile key={metric.label} {...metric} />
                ))}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Fusion Policy Snapshot" subtitle="Current adaptive profile and threshold controls">
                    <div className="mono grid gap-2 text-sm">
                        <p>policy: {policy?.policy ?? "unavailable"}</p>
                        <p>default_threshold: {policy ? policy.defaultThreshold.toFixed(2) : "N/A"}</p>
                        <p>risk_multiplier: {policy ? policy.riskMultiplier.toFixed(2) : "N/A"}</p>
                        <p>environment_multiplier: {policy ? policy.environmentMultiplier.toFixed(2) : "N/A"}</p>
                    </div>
                </SectionCard>

                <SectionCard title="Deployment Readiness" subtitle="Phase checkpoints to support production hardening">
                    <ul className="grid gap-2 text-sm text-[var(--muted)]">
                        <li>- Next.js portal scaffolded with App Router</li>
                        <li>- Shared navigation and design token system applied</li>
                        <li>- Reusable cards and metric components available</li>
                        <li>- Ready for enrollment simulator and data integrations in Phase 7</li>
                    </ul>
                </SectionCard>
            </section>
        </div>
    );
}
