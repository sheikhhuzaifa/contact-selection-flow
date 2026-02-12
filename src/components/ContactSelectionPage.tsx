'use client';

import * as React from "react";
import {
  AppBar,
  Toolbar,
  Box,
  Container,
  Stack,
  Typography,
  Divider,
  Button,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { AppState, Contact } from "@/types/contact";
import { ContactField } from "@/components/ContactField";

const STORAGE_KEY = "contact-selection-state-v1";

function loadInitialState(): AppState {
  if (typeof window === "undefined") {
    return { client: null, primaryContact: null, secondaryContact: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { client: null, primaryContact: null, secondaryContact: null };
    }
    const parsed = JSON.parse(raw) as AppState;
    return {
      client: parsed.client ?? null,
      primaryContact: parsed.primaryContact ?? null,
      secondaryContact: parsed.secondaryContact ?? null,
    };
  } catch {
    return { client: null, primaryContact: null, secondaryContact: null };
  }
}

export function ContactSelectionPage() {
  const [state, setState] = React.useState<AppState>(() => loadInitialState());
  const [snackbar, setSnackbar] = React.useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const showSnackbar = React.useCallback(
    (message: string, severity: "success" | "error" = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const handleFieldChange =
    (key: keyof AppState) =>
    (value: Contact | null): void => {
      setState((prev) => ({ ...prev, [key]: value }));
    };

  const handleLogChange = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (action: "create" | "update", _contact: Contact) => {
      const actionLabel = action === "create" ? "created" : "updated";
      showSnackbar(`Contact ${actionLabel} successfully`, "success");
    },
    [showSnackbar]
  );

  const handleFinalSubmit = async () => {
    try {
      const response = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          payload: state,
        }),
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorDetails = `Server responded with status ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorDetails = errorData.message;
          } else if (errorData.error) {
            errorDetails = errorData.error;
          }
        } catch {
          // If we can't parse the error response, use the status
        }
        throw new Error(errorDetails);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("Failed to parse server response");
      }

      if (data && data.ok) {
        showSnackbar("All selections submitted and logged successfully", "success");
      } else {
        const errorMsg = data?.message || data?.error || "Server returned an error";
        throw new Error(errorMsg);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? `Failed to submit: ${error.message}`
          : "Failed to submit selections. Please try again.";
      showSnackbar(errorMessage, "error");
      console.error("Submit error:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar sx={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Contact Selection Flow
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={{ xs: 2, sm: 3 }}>
          <Paper
            sx={{
              p: { xs: 2.5, sm: 3 },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1.5, sm: 1 },
            }}
          >
            <Typography 
              variant="h4"
              sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
            >
              Client &amp; Contact Selection
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
            >
              Search, select, and refine contact details for your client and
              their primary and secondary contacts. Changes are saved
              automatically.
            </Typography>
          </Paper>

          <Stack
            spacing={{ xs: 2, sm: 3 }}
            direction={{ xs: "column", md: "row" }}
            alignItems="stretch"
          >
            <Box flex={1}>
              <ContactField
                label="Client 1"
                fieldKey="client"
                value={state.client}
                onChange={handleFieldChange("client")}
                onLogChange={handleLogChange}
              />
            </Box>
            <Box flex={1}>
              <ContactField
                label="Client 1 Primary Contact"
                fieldKey="primaryContact"
                value={state.primaryContact}
                onChange={handleFieldChange("primaryContact")}
                onLogChange={handleLogChange}
              />
            </Box>
          </Stack>

          <ContactField
            label="Client 1 Secondary Contact"
            fieldKey="secondaryContact"
            value={state.secondaryContact}
            onChange={handleFieldChange("secondaryContact")}
            onLogChange={handleLogChange}
          />

          <Divider />

          <Paper
            sx={{
              p: { xs: 2.5, sm: 2.5, md: 3 },
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              gap: { xs: 2.5, sm: 2 },
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ 
                flex: { xs: "none", sm: 1 },
                mb: 0,
                textAlign: { xs: "left", sm: "left" },
                lineHeight: 1.6,
              }}
            >
              Review your selections above. When you are satisfied, use{" "}
              <strong>Final Submit</strong> to log the full configuration on the
              server.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFinalSubmit}
              fullWidth={false}
              sx={{
                width: { xs: "100%", sm: "auto" },
                minWidth: { xs: "100%", sm: "140px" },
                px: { xs: 3, sm: 3, md: 4 },
                py: { xs: 1.75, sm: 1.25 },
                fontSize: { xs: "0.9375rem", sm: "0.9375rem", md: "1rem" },
                fontWeight: 600,
                borderRadius: { xs: 2, sm: "999px" },
                textTransform: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              Final Submit
            </Button>
          </Paper>
        </Stack>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
