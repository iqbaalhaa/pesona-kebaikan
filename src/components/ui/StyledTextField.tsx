import { TextField, TextFieldProps } from "@mui/material";

export const StyledTextField = (props: TextFieldProps) => {
  return (
    <TextField
      {...props}
      size={props.size ?? "small"}
      InputProps={{
        ...props.InputProps,
        sx: { fontSize: "0.875rem", ...props.InputProps?.sx },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
          bgcolor: "rgba(241, 245, 249, 0.5)",
          "& fieldset": { borderColor: "rgba(226, 232, 240, 0.8)" },
          "&:hover fieldset": { borderColor: "primary.main" },
          "&.Mui-focused fieldset": { borderColor: "primary.main" },
        },
        ...props.sx,
      }}
    />
  );
};
