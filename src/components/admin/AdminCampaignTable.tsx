 "use client";
 
 import * as React from "react";
 import {
   Box,
   Paper,
   Typography,
   Stack,
   Chip,
   TextField,
   FormControl,
   InputLabel,
   Select,
   MenuItem,
   TableContainer,
   Table,
   TableHead,
   TableRow,
   TableCell,
   TableBody,
   IconButton,
   LinearProgress,
   Skeleton,
 } from "@mui/material";
 import LocalHospitalRoundedIcon from "@mui/icons-material/LocalHospitalRounded";
 import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
 import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
 
 type CampaignStatus =
   | "draft"
   | "review"
   | "active"
   | "ended"
   | "rejected"
   | "pending";
 
 type CampaignType = "sakit" | "lainnya";
 
 export type AdminCampaignRow = {
   id: string;
   title: string;
   category: string;
   type: CampaignType;
   ownerName: string;
   target: number;
   collected: number;
   donors: number;
   status: CampaignStatus;
   updatedAt: string;
   thumbnail?: string;
 };
 
 function idr(n: number) {
   const v = Number(n) || 0;
   const s = Math.round(v).toString();
   return "Rp" + s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
 }
 
 function pct(collected: number, target: number) {
   const c = Number(collected) || 0;
   const t = Number(target) || 0;
   if (!t || t <= 0) return 0;
   return Math.max(0, Math.min(100, Math.round((c / t) * 100)));
 }
 
 function statusChip(status: CampaignStatus) {
   switch (status) {
     case "draft":
       return {
         label: "Draft",
         sx: {
           bgcolor: "rgba(15,23,42,.06)",
           borderColor: "rgba(15,23,42,.10)",
           color: "rgba(15,23,42,.70)",
         },
       };
     case "pending":
       return {
         label: "Pending",
         sx: {
           bgcolor: "rgba(245,158,11,.12)",
           borderColor: "rgba(245,158,11,.22)",
           color: "rgba(180,83,9,.95)",
         },
       };
     case "review":
       return {
         label: "Review",
         sx: {
           bgcolor: "rgba(245,158,11,.12)",
           borderColor: "rgba(245,158,11,.22)",
           color: "rgba(180,83,9,.95)",
         },
       };
     case "active":
       return {
         label: "Aktif",
         sx: {
           bgcolor: "rgba(34,197,94,.12)",
           borderColor: "rgba(34,197,94,.22)",
           color: "rgba(22,101,52,.95)",
         },
       };
     case "ended":
       return {
         label: "Berakhir",
         sx: {
           bgcolor: "rgba(239,68,68,.12)",
           borderColor: "rgba(239,68,68,.22)",
           color: "rgba(153,27,27,.95)",
         },
       };
     case "rejected":
       return {
         label: "Ditolak",
         sx: {
           bgcolor: "rgba(239,68,68,.12)",
           borderColor: "rgba(239,68,68,.22)",
           color: "rgba(153,27,27,.95)",
         },
       };
     default:
       return {
         label: status || "Unknown",
         sx: {
           bgcolor: "rgba(15,23,42,.06)",
           borderColor: "rgba(15,23,42,.10)",
           color: "rgba(15,23,42,.70)",
         },
       };
   }
 }
 
 export default function AdminCampaignTable({
   rows,
   loading,
   provinces,
   provinceId,
   onProvinceChange,
   startDate,
   onStartDateChange,
   endDate,
   onEndDateChange,
   onOpenMenu,
 }: {
   rows: AdminCampaignRow[];
   loading: boolean;
   provinces: Array<{ id: string; name: string }>;
   provinceId: string;
   onProvinceChange: (v: string) => void;
   startDate: string;
   onStartDateChange: (v: string) => void;
   endDate: string;
   onEndDateChange: (v: string) => void;
   onOpenMenu: (e: React.MouseEvent<HTMLElement>, row: AdminCampaignRow) => void;
 }) {
   return (
     <TableContainer
       component={Paper}
       sx={{
         borderRadius: 3,
         border: "1px solid rgba(15,23,42,.10)",
         overflowX: "auto",
         maxWidth: 1040,
         mx: "auto",
       }}
       elevation={0}
     >
       <Box
         sx={{
           p: 1.25,
           borderBottom: "1px solid rgba(15,23,42,.08)",
           bgcolor: "rgba(255,255,255,.66)",
         }}
       >
         <Stack
           direction="row"
           spacing={1.5}
           alignItems="center"
           flexWrap="wrap"
           justifyContent="flex-end"
           sx={{ width: "100%" }}
         >
           <FormControl size="small" sx={{ minWidth: 220 }}>
             <InputLabel id="province-label">Daerah</InputLabel>
             <Select
               labelId="province-label"
               label="Daerah"
               value={provinceId}
               onChange={(e) => onProvinceChange(String(e.target.value))}
               sx={{
                 borderRadius: 2,
                 bgcolor: "rgba(255,255,255,.70)",
                 "& .MuiOutlinedInput-notchedOutline": {
                   borderColor: "rgba(15,23,42,.10)",
                 },
               }}
             >
               <MenuItem value="all">Semua</MenuItem>
               {provinces.map((p) => (
                 <MenuItem key={p.id} value={p.id}>
                   {p.name}
                 </MenuItem>
               ))}
             </Select>
           </FormControl>
 
           <TextField
             size="small"
             type="date"
             label="Tanggal mulai"
             value={startDate}
             onChange={(e) => onStartDateChange(e.target.value)}
             InputLabelProps={{ shrink: true }}
             sx={{
               "& .MuiOutlinedInput-root": {
                 borderRadius: 2,
                 bgcolor: "rgba(255,255,255,.70)",
                 "& fieldset": { borderColor: "rgba(15,23,42,.10)" },
               },
               "& .MuiOutlinedInput-input": { fontSize: 13.5 },
             }}
           />
 
           <TextField
             size="small"
             type="date"
             label="Tanggal akhir"
             value={endDate}
             onChange={(e) => onEndDateChange(e.target.value)}
             InputLabelProps={{ shrink: true }}
             sx={{
               "& .MuiOutlinedInput-root": {
                 borderRadius: 2,
                 bgcolor: "rgba(255,255,255,.70)",
                 "& fieldset": { borderColor: "rgba(15,23,42,.10)" },
               },
               "& .MuiOutlinedInput-input": { fontSize: 13.5 },
             }}
           />
         </Stack>
       </Box>
 
       <Table
         size="small"
         sx={{
           tableLayout: "fixed",
           "& td, & th": { px: 1.75, py: 1.25 },
         }}
       >
         <TableHead>
           <TableRow>
             <TableCell sx={{ fontWeight: 900, width: 260 }} align="center">Judul</TableCell>
             <TableCell sx={{ fontWeight: 900, width: 260 }} align="center">Info</TableCell>
             <TableCell sx={{ fontWeight: 900, width: 190 }} align="center">Dana</TableCell>
             <TableCell sx={{ fontWeight: 900, width: 90 }} align="center">Donatur</TableCell>
             <TableCell sx={{ fontWeight: 900, width: 110 }} align="center">Status</TableCell>
             <TableCell sx={{ fontWeight: 900, width: 140 }} align="center">Update</TableCell>
             <TableCell sx={{ fontWeight: 900, width: 64 }} align="right">
               Aksi
             </TableCell>
           </TableRow>
         </TableHead>
 
         <TableBody>
           {loading ? (
             Array.from({ length: 6 }).map((_, i) => (
               <TableRow key={i}>
                 <TableCell>
                   <Skeleton width="80%" />
                   <Skeleton width="55%" />
                 </TableCell>
                 <TableCell>
                   <Skeleton width="70%" />
                   <Skeleton width="40%" />
                 </TableCell>
                 <TableCell>
                   <Skeleton width="70%" />
                   <Skeleton width="55%" />
                 </TableCell>
                 <TableCell sx={{ textAlign: "center" }}>
                   <Skeleton width={40} />
                 </TableCell>
                 <TableCell>
                   <Skeleton width={80} />
                 </TableCell>
                 <TableCell>
                   <Skeleton width={90} />
                 </TableCell>
                 <TableCell align="right">
                   <Skeleton width={30} />
                 </TableCell>
               </TableRow>
             ))
           ) : rows.length === 0 ? (
             <TableRow>
               <TableCell colSpan={7}>
                 <Box sx={{ py: 6, textAlign: "center" }}>
                   <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
                     Tidak ada data
                   </Typography>
                   <Typography
                     sx={{ mt: 0.5, fontSize: 13, color: "rgba(15,23,42,.60)" }}
                   >
                     Coba ubah filter, tanggal, atau kata kunci pencarian.
                   </Typography>
                 </Box>
               </TableCell>
             </TableRow>
           ) : (
             rows.map((row) => {
               const st = statusChip(row.status);
               const progress = pct(row.collected, row.target);
 
               return (
                 <TableRow key={row.id} hover>
                   <TableCell>
                     <Stack
                       direction="row"
                       spacing={1}
                       alignItems="center"
                       sx={{ minWidth: 0 }}
                     >
                       {row.thumbnail ? (
                         <Box
                           component="img"
                           src={row.thumbnail}
                           alt={row.title}
                           sx={{
                             width: 40,
                             height: 40,
                             borderRadius: 2,
                             objectFit: "cover",
                             border: "1px solid rgba(15,23,42,.10)",
                             flexShrink: 0,
                           }}
                         />
                       ) : (
                         <Box
                           sx={{
                             width: 40,
                             height: 40,
                             borderRadius: 2,
                             display: "grid",
                             placeItems: "center",
                             bgcolor: "rgba(15,23,42,.06)",
                             border: "1px solid rgba(15,23,42,.10)",
                             color: "rgba(15,23,42,.72)",
                             flexShrink: 0,
                           }}
                         >
                           {row.type === "sakit" ? (
                             <LocalHospitalRoundedIcon fontSize="small" />
                           ) : (
                             <CategoryRoundedIcon fontSize="small" />
                           )}
                         </Box>
                       )}
 
                       <Box sx={{ minWidth: 0, flex: 1 }}>
                         <Typography
                           sx={{
                             fontWeight: 1000,
                             fontSize: 12.5,
                             lineHeight: 1.2,
                             color: "#0f172a",
                             display: "-webkit-box",
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: "vertical",
                             overflow: "hidden",
                             textOverflow: "ellipsis",
                           }}
                         >
                           {row.title}
                         </Typography>
 
                         <Stack
                           direction="row"
                           spacing={1}
                           alignItems="center"
                           sx={{ mt: 0.35 }}
                         >
                           <Typography
                             sx={{ fontSize: 11, color: "rgba(15,23,42,.55)" }}
                           >
                             {row.id}
                           </Typography>
                           <Typography
                             sx={{
                               fontSize: 11,
                               fontWeight: 900,
                               color: "rgba(15,23,42,.70)",
                             }}
                           >
                             {progress}%
                           </Typography>
                         </Stack>
 
                         <LinearProgress
                           variant="determinate"
                           value={progress}
                           sx={{
                             mt: 0.6,
                             height: 5,
                             borderRadius: 999,
                             bgcolor: "rgba(15,23,42,.08)",
                             "& .MuiLinearProgress-bar": {
                               borderRadius: 999,
                               background:
                                 "linear-gradient(90deg, #0ba976, rgba(11,169,118,.55))",
                             },
                           }}
                         />
                       </Box>
                     </Stack>
                   </TableCell>
 
                   <TableCell>
                     <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                       <Typography
                         sx={{
                           fontSize: 12.25,
                           fontWeight: 800,
                           color: "rgba(15,23,42,.85)",
                           whiteSpace: "nowrap",
                           overflow: "hidden",
                           textOverflow: "ellipsis",
                         }}
                       >
                         {row.category}
                       </Typography>
 
                       <Stack
                         direction="row"
                         spacing={0.75}
                         alignItems="center"
                         flexWrap="wrap"
                       >
                         <Chip
                           label={row.type === "sakit" ? "Medis" : "Lainnya"}
                           size="small"
                           sx={{
                             height: 22,
                             fontWeight: 900,
                             borderRadius: 999,
                             bgcolor:
                               row.type === "sakit"
                                 ? "rgba(56,189,248,.16)"
                                 : "rgba(11,169,118,.14)",
                             color:
                               row.type === "sakit"
                                 ? "rgba(2,132,199,.95)"
                                 : "rgba(22,101,52,.95)",
                             "& .MuiChip-label": { px: 1, fontSize: 11.5 },
                           }}
                         />
                         <Chip
                           label={row.ownerName}
                           size="small"
                           variant="outlined"
                           sx={{
                             height: 22,
                             borderRadius: 999,
                             borderColor: "rgba(15,23,42,.14)",
                             bgcolor: "rgba(255,255,255,.55)",
                             "& .MuiChip-label": { px: 1, fontSize: 11.5 },
                             maxWidth: "100%",
                           }}
                         />
                       </Stack>
                     </Stack>
                   </TableCell>
 
                   <TableCell>
                     <Chip
                       label={`${idr(row.collected)} / ${idr(row.target)}`}
                       size="small"
                       variant="outlined"
                       sx={{
                         height: 24,
                         borderRadius: 999,
                         fontWeight: 1000,
                         borderColor: "rgba(15,23,42,.14)",
                         bgcolor: "rgba(255,255,255,.55)",
                         "& .MuiChip-label": { px: 1, fontSize: 11.5 },
                       }}
                     />
                   </TableCell>
 
                   <TableCell sx={{ textAlign: "center" }}>
                     <Typography
                       sx={{
                         fontWeight: 1000,
                         fontSize: 12,
                         color: "rgba(15,23,42,.80)",
                       }}
                     >
                       {row.donors}
                     </Typography>
                   </TableCell>
 
                   <TableCell>
                     <Chip
                       label={st.label}
                       size="small"
                       variant="outlined"
                       sx={{
                         height: 24,
                         borderRadius: 999,
                         fontWeight: 1000,
                         ...st.sx,
                         "& .MuiChip-label": { px: 1, fontSize: 11.5 },
                       }}
                     />
                   </TableCell>
 
                   <TableCell>
                     <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,.70)" }}>
                       {row.updatedAt}
                     </Typography>
                   </TableCell>
 
                   <TableCell align="right">
                     <IconButton
                       onClick={(e) => onOpenMenu(e, row)}
                       sx={{
                         width: 34,
                         height: 34,
                         borderRadius: 2,
                         bgcolor: "rgba(255,255,255,.55)",
                         border: "1px solid rgba(15,23,42,.10)",
                         color: "rgba(15,23,42,.70)",
                         "&:hover": { bgcolor: "rgba(255,255,255,.78)" },
                       }}
                     >
                       <MoreHorizRoundedIcon fontSize="small" />
                     </IconButton>
                   </TableCell>
                 </TableRow>
               );
             })
           )}
         </TableBody>
       </Table>
     </TableContainer>
   );
 }
