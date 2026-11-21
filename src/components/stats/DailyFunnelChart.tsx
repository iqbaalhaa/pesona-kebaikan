"use client";

import * as React from "react";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import { GridComponent, LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { DailyRow } from "@/lib/campaign-stats";

echarts.use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

const SERIES: { key: keyof DailyRow; name: string; color: string }[] = [
	{ key: "views", name: "Dilihat", color: "#64748b" },
	{ key: "clicks", name: "Klik Donasi", color: "#0ea5e9" },
	{ key: "checkouts", name: "Checkout", color: "#f59e0b" },
	{ key: "paid", name: "Dibayar", color: "#0ba976" },
];

export default function DailyFunnelChart({ daily }: { daily: DailyRow[] }) {
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (!ref.current) return;
		const chart = echarts.init(ref.current);
		chart.setOption({
			tooltip: { trigger: "axis" },
			legend: { bottom: 0, icon: "circle", itemWidth: 8, itemHeight: 8 },
			grid: { left: 36, right: 12, top: 12, bottom: 40 },
			xAxis: { type: "category", data: daily.map((d) => d.date.slice(5)), boundaryGap: false },
			yAxis: { type: "value", minInterval: 1 },
			series: SERIES.map((s) => ({
				name: s.name,
				type: "line",
				smooth: true,
				showSymbol: false,
				lineStyle: { width: 2 },
				itemStyle: { color: s.color },
				data: daily.map((d) => d[s.key]),
			})),
		});
		const onResize = () => chart.resize();
		window.addEventListener("resize", onResize);
		return () => {
			window.removeEventListener("resize", onResize);
			chart.dispose();
		};
	}, [daily]);

	return <div ref={ref} style={{ width: "100%", height: 260 }} />;
}
