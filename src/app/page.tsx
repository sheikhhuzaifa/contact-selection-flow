"use client";

import * as React from "react";
import {
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Client & Contact Selection
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Search, select, and edit contact details for your client and their
            primary and secondary contacts.
          </Typography>
        </Box>

        <Stack spacing={3}>
          <ContactField
            label="Client 1"
            fieldKey="client"
            value={state.client}
            onChange={handleFieldChange("client")}
            onLogChange={handleLogChange}
          />
          <ContactField
            label="Client 1 Primary Contact"
            fieldKey="primaryContact"
            value={state.primaryContact}
            onChange={handleFieldChange("primaryContact")}
            onLogChange={handleLogChange}
          />
          <ContactField
            label="Client 1 Secondary Contact"
            fieldKey="secondaryContact"
            value={state.secondaryContact}
            onChange={handleFieldChange("secondaryContact")}
            onLogChange={handleLogChange}
          />
        </Stack>

        <Divider />

        <Paper
          elevation={0}
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            When you are finished, submit the current selections. This will log
            the full payload on the server.
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
  );
}
