'use client';

import * as React from "react";
import {
  Box,
  TextField,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { Contact, ContactFieldKey } from "@/types/contact";
import { ContactSummaryCard } from "./ContactSummaryCard";
import { ContactModal } from "./ContactModal";

interface ContactFieldProps {
  label: string;
  fieldKey: ContactFieldKey;
  value: Contact | null;
  onChange: (value: Contact | null) => void;
  onLogChange: (action: "create" | "update", contact: Contact) => void;
}

interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  company?: {
    name?: string;
  };
  address?: {
    address?: string;
    city?: string;
    country?: string;
  };
}

const DEBOUNCE_MS = 400;

export function ContactField({
  label,
  fieldKey,
  value,
  onChange,
  onLogChange,
}: ContactFieldProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"create" | "edit">("edit");

  React.useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const controller = new AbortController();
    const handle = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          `https://dummyjson.com/users/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error(`Search failed with status ${res.status}`);
        }
        const data = await res.json();
        const mapped: Contact[] = (data.users as DummyUser[]).map((user) => ({
          id: `dummy-${user.id}`,
          type: "individual",
          name: `${user.firstName} ${user.lastName}`.trim(),
          firstName: user.firstName,
          lastName: user.lastName,
          companyName: user.company?.name ?? "",
          email: user.email,
          addressLine1: user.address?.address ?? "",
          city: user.address?.city ?? "",
          country: user.address?.country ?? "",
        }));
        setResults(mapped);
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(handle);
    };
  }, [query]);

  const handleSelect = (contact: Contact) => {
    onChange(contact);
  };

  const handleEdit = () => {
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleCreateNew = () => {
    setModalMode("create");
    setModalOpen(true);
  };

  const handleModalSave = async (contact: Contact) => {
    onChange(contact);
    setModalOpen(false);
    const action: "create" | "update" =
      modalMode === "create" || !value ? "create" : "update";
    onLogChange(action, contact);

    // Fire-and-forget logging to server
    try {
      await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          field: fieldKey,
          payload: contact,
        }),
      });
    } catch {
      // Swallow logging errors for this assignment
    }
  };

  return (
    <Box
      component={Paper}
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 3,
        borderColor: value ? "primary.light" : "divider",
        bgcolor: "background.paper",
        backgroundImage: value
          ? "linear-gradient(135deg, rgba(25,118,210,0.02), rgba(66,165,245,0.06))"
          : "none",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease, transform 0.1s ease",
        "&:hover": {
          boxShadow: 3,
          borderColor: "primary.main",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {label}
          </Typography>
          <IconButton
            size="small"
            onClick={handleCreateNew}
            color="primary"
            aria-label={`Create new contact for ${label}`}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Stack>
        <TextField
          label="Search contacts"
          variant="outlined"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          fullWidth
          placeholder="Type a name, email, or company"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        {loading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Searching…
            </Typography>
          </Stack>
        )}
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        {results.length > 0 && (
          <Paper
            variant="outlined"
            sx={{ maxHeight: 260, overflowY: "auto", borderRadius: 2 }}
          >
            <List dense>
              {results.map((contact) => (
                <ListItemButton
                  key={contact.id}
                  selected={value?.id === contact.id}
                  onClick={() => handleSelect(contact)}
                >
                  <ListItemText
                    primary={contact.name}
                    secondary={`${contact.email} • Individual`}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>
        )}
        {value && (
          <ContactSummaryCard
            contact={value}
            onEdit={handleEdit}
          />
        )}
      </Stack>
      <ContactModal
        open={modalOpen}
        mode={modalMode}
        initialContact={modalMode === "edit" ? value : null}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
      />
    </Box>
  );
}

