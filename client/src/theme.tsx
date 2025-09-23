import { createTheme } from "@mui/material/styles";

// Create a theme instance
export const theme = createTheme({
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1a1a1a", // Dark color
          color: "#ffffff",
        },
      },
    },
  },
});
