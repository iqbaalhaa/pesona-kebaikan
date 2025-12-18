import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

const campaigns = [
  {
    id: 1,
    title: "Bantu Pembangunan Masjid Al-Ikhlas",
    creator: "Ustadz Ahmad",
    target: "Rp 100.000.000",
    collected: "Rp 50.000.000",
    status: "Verified",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Operasi Jantung Adik Budi",
    creator: "Ibu Siti",
    target: "Rp 50.000.000",
    collected: "Rp 10.000.000",
    status: "Pending",
    date: "2024-02-01",
  },
  {
    id: 3,
    title: "Sedekah Jumat Berkah",
    creator: "Komunitas Berbagi",
    target: "Rp 10.000.000",
    collected: "Rp 12.000.000",
    status: "Verified",
    date: "2024-02-10",
  },
  {
    id: 4,
    title: "Bantuan Banjir Demak",
    creator: "Relawan Demak",
    target: "Rp 200.000.000",
    collected: "Rp 150.000.000",
    status: "Ended",
    date: "2024-01-05",
  },
];

export default function CampaignPage() {
  return (
    <Box>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <Typography variant="h5" component="h1" className="font-bold text-gray-900 dark:text-white">
          Daftar Campaign
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          className="bg-blue-600 hover:bg-blue-700 text-white normal-case font-semibold rounded-lg shadow-none"
        >
          Buat Campaign Baru
        </Button>
      </div>

      <TableContainer component={Paper} className="shadow-sm border border-gray-200 dark:border-gray-800 dark:bg-[#1e293b] rounded-xl overflow-hidden">
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead className="bg-gray-50 dark:bg-[#0f172a]">
            <TableRow>
              <TableCell className="font-bold text-gray-700 dark:text-gray-300">Judul Campaign</TableCell>
              <TableCell className="font-bold text-gray-700 dark:text-gray-300">Penggalang</TableCell>
              <TableCell className="font-bold text-gray-700 dark:text-gray-300">Target</TableCell>
              <TableCell className="font-bold text-gray-700 dark:text-gray-300">Terkumpul</TableCell>
              <TableCell className="font-bold text-gray-700 dark:text-gray-300">Status</TableCell>
              <TableCell className="font-bold text-gray-700 dark:text-gray-300" align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((row) => (
              <TableRow
                key={row.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors"
              >
                <TableCell component="th" scope="row" className="font-medium text-gray-900 dark:text-gray-100">
                  {row.title}
                  <div className="text-xs text-gray-500 font-normal mt-1">{row.date}</div>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">{row.creator}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">{row.target}</TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">{row.collected}</TableCell>
                <TableCell>
                  <Chip 
                    label={row.status} 
                    size="small"
                    className={`
                      ${row.status === 'Verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
                      ${row.status === 'Pending' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : ''}
                      ${row.status === 'Ended' ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' : ''}
                      font-semibold border-none
                    `}
                  />
                </TableCell>
                <TableCell align="right">
                  <div className="flex gap-2 justify-end">
                    <IconButton size="small" className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
