import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsOverview({ title, value, icon: Icon, gradient, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden bg-white/60 backdrop-blur-sm border-slate-200/60 hover:shadow-lg transition-all duration-300">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 transform translate-x-8 -translate-y-8 rounded-full`} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-600">
              {title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-10`}>
              <Icon className={`w-5 h-5 text-transparent bg-gradient-to-br ${gradient} bg-clip-text`} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900 mb-1">
            {value}
          </div>
          <p className="text-sm text-slate-500">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}