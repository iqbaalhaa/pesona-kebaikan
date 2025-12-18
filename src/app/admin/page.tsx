import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CampaignIcon from "@mui/icons-material/Campaign";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";

export default function AdminDashboard() {
  const stats = [
    { title: "Total Earning", value: "$500.00", icon: <CreditCardIcon className="text-white" />, bg: "from-[#6f7bf7] to-[#8466f6]" },
    { title: "Total Order", value: "$961", icon: <ReceiptLongIcon className="text-white" />, bg: "from-[#1fb8ff] to-[#3b82f6]" },
    { title: "Total Income", value: "$203k", icon: <MonetizationOnIcon className="text-white" />, bg: "from-[#22c55e] to-[#16a34a]" },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid key={index} item xs={12} md={4}>
            <Card className="h-full border-none shadow-sm">
              <CardContent className="p-0">
                <div className={`p-6 rounded-t-xl bg-gradient-to-br ${stat.bg}`}>
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-lg bg-white/20 flex items-center justify-center">
                      {stat.icon}
                    </div>
                    <IconButton size="small" className="text-white/90">
                      <MoreHorizIcon />
                    </IconButton>
                  </div>
                  <div className="mt-6">
                    <div className="text-white/80 text-sm">{stat.title}</div>
                    <div className="text-white text-3xl font-bold mt-1">{stat.value}</div>
                  </div>
                </div>
                <div className="p-4 bg-white dark:bg-[#0f172a] rounded-b-xl flex items-center justify-between">
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-semibold">
                    <ArrowUpwardIcon fontSize="small" />
                    10%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Compared to last month</div>
                </div>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card className="h-full border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Typography variant="h6" className="font-bold">Total Growth</Typography>
                <button className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#0b1324]">
                  Today
                </button>
              </div>
              <div className="mt-4">
                <Typography variant="h4" className="font-bold">$2,324.00</Typography>
              </div>
              <div className="mt-6">
                <svg viewBox="0 0 600 240" className="w-full h-56">
                  <rect x="0" y="0" width="600" height="240" fill="none" />
                  {[60,120,180,240,300,360,420,480,540].map((x, i) => (
                    <g key={i}>
                      <rect x={x-18} y={200 - (i%4)*40} width="12" height={(i%4)*40 + 60} fill="#93c5fd" rx="2" />
                      <rect x={x-4} y={180 - (i%3)*30} width="12" height={(i%3)*30 + 80} fill="#6366f1" rx="2" />
                      <rect x={x+10} y={160 - (i%5)*20} width="12" height={(i%5)*20 + 100} fill="#a78bfa" rx="2" />
                    </g>
                  ))}
                </svg>
              </div>
              <Divider className="my-4" />
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded bg-[#93c5fd]" />
                  Investment
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded bg-[#6366f1]" />
                  Loss
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded bg-[#a78bfa]" />
                  Profit
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className="h-full border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Typography variant="h6" className="font-bold">Popular Stocks</Typography>
                <IconButton size="small">
                  <MoreHorizIcon />
                </IconButton>
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { name: "Bajaj Finery", value: "$1839.00", trend: "10% Profit", positive: true },
                  { name: "TTML", value: "$100.00", trend: "10% loss", positive: false },
                  { name: "Reliance", value: "$200.00", trend: "12% Profit", positive: true },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                    <div>
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className={`text-xs ${item.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>{item.trend}</div>
                    </div>
                    <div className="text-sm font-bold">{item.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
