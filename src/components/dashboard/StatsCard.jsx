import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({ title, value, subtitle, icon: Icon, trend, bgColor = "bg-blue-500" }) {
  return (
    <Card className="shadow-lg border-0 bg-white/90 backdrop-blur hover:shadow-xl transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-14 h-14 ${bgColor} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center gap-2 text-sm">
            {trend.direction === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-500" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500" />
            )}
            <span className={trend.direction === "up" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {trend.text}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}