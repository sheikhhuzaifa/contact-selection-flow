"use client";

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

export default function Home() {
  const [state, setState] = React.useState<AppState>(() => loadInitialState());

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const handleFieldChange =
    (key: keyof AppState) =>
    (value: Contact | null): void => {
      setState((prev) => ({ ...prev, [key]: value }));
    };

  const handleLogChange = React.useCallback(
    (action: "create" | "update", contact: Contact) => {
      // Currently unused at the page level, but kept for potential extension
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _noop = { action, contact };
    },
    []
  );

  const handleFinalSubmit = async () => {
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          payload: state,
        }),
      });
      // For this assignment we do not need further UI for success/failure
    } catch {
      // swallow logging errors
    }
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
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Paper
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Typography variant="h4">
              Client &amp; Contact Selection
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Search, select, and refine contact details for your client and
              their primary and secondary contacts. Changes are saved
              automatically.
            </Typography>
          </Paper>

          <Stack
            spacing={3}
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
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Review your selections above. When you are satisfied, use{" "}
              <strong>Final Submit</strong> to log the full configuration on the
              server.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFinalSubmit}
            >
              Final Submit
            </Button>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}
