'use client';

import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";

type Status = "Verified" | "Pending" | "Ended";

export default function SearchFilterBar({
  query,
  status,
  onQueryChange,
  onStatusChange,
  onCreate,
}: {
  query: string;
  status: Status | "ALL";
  onQueryChange: (v: string) => void;
  onStatusChange: (v: Status | "ALL") => void;
  onCreate: () => void;
}) {
  return (
    <div className="flex w-full lg:w-auto items-center gap-3">
      <TextField
        fullWidth
        placeholder="Cari campaign"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        size="small"
      />
      <FormControl size="small" className="min-w-40">
        <InputLabel id="status-label">Status</InputLabel>
        <Select
          labelId="status-label"
          value={status}
          label="Status"
          onChange={(e) => onStatusChange(e.target.value as Status | "ALL")}
        >
          <MenuItem value="ALL">Semua</MenuItem>
          <MenuItem value="Verified">Verified</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Ended">Ended</MenuItem>
        </Select>
      </FormControl>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        className="bg-blue-600 hover:bg-blue-700 text-white normal-case font-semibold"
        onClick={onCreate}
      >
        Buat Campaign Baru
      </Button>
    </div>
  );
}
