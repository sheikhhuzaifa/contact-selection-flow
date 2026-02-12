'use client';

import Grid from "@mui/material/Grid";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import * as React from "react";
import { Contact, ContactType } from "@/types/contact";

type Mode = "create" | "edit";

interface ContactModalProps {
  open: boolean;
  mode: Mode;
  initialContact: Contact | null;
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

interface Errors {
  [key: string]: string | undefined;
}

export function ContactModal({
  open,
  mode,
  initialContact,
  onClose,
  onSave,
}: ContactModalProps) {
  const [draft, setDraft] = React.useState<Contact | null>(initialContact);
  const [errors, setErrors] = React.useState<Errors>({});

  React.useEffect(() => {
    if (open) {
      setDraft(
        initialContact ?? {
          id: crypto.randomUUID(),
          type: "individual",
          name: "",
          firstName: "",
          lastName: "",
          companyName: "",
          email: "",
          addressLine1: "",
          city: "",
          country: "",
        }
      );
      setErrors({});
    }
  }, [initialContact, open]);

  if (!draft) return null;

  const handleChange =
    (field: keyof Contact) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
    };

  const handleTypeChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: ContactType | null
  ) => {
    if (!value) return;
    setDraft((prev) => (prev ? { ...prev, type: value } : prev));
  };

  const validate = (contact: Contact): boolean => {
    const nextErrors: Errors = {};

    if (!contact.name.trim()) {
      nextErrors.name = "Name is required";
    }
    if (!contact.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
      nextErrors.email = "Email is not valid";
    }
    if (!contact.addressLine1.trim()) {
      nextErrors.addressLine1 = "Address line 1 is required";
    }
    if (!contact.city.trim()) {
      nextErrors.city = "City is required";
    }
    if (!contact.country.trim()) {
      nextErrors.country = "Country is required";
    }

    if (contact.type === "company") {
      if (!contact.companyName?.trim()) {
        nextErrors.companyName = "Company name is required for companies";
      }
    } else if (contact.type === "individual") {
      if (!contact.firstName?.trim()) {
        nextErrors.firstName = "First name is required for individuals";
      }
      if (!contact.lastName?.trim()) {
        nextErrors.lastName = "Last name is required for individuals";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!draft) return;
    const updated: Contact = {
      ...draft,
      name:
        draft.type === "individual"
          ? `${draft.firstName ?? ""} ${draft.lastName ?? ""}`.trim()
          : draft.companyName ?? draft.name,
    };

    if (!validate(updated)) {
      return;
    }

    onSave(updated);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "create" ? "Create Contact" : "Edit Contact"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={12}>
            <ToggleButtonGroup
              exclusive
              value={draft.type}
              onChange={handleTypeChange}
              aria-label="contact type"
            >
              <ToggleButton value="individual">Individual</ToggleButton>
              <ToggleButton value="company">Company</ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Name"
              fullWidth
              value={draft.name}
              onChange={handleChange("name")}
              error={Boolean(errors.name)}
              helperText={errors.name}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              fullWidth
              value={draft.email}
              onChange={handleChange("email")}
              error={Boolean(errors.email)}
              helperText={errors.email}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Address Line 1"
              fullWidth
              value={draft.addressLine1}
              onChange={handleChange("addressLine1")}
              error={Boolean(errors.addressLine1)}
              helperText={errors.addressLine1}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="City"
              fullWidth
              value={draft.city}
              onChange={handleChange("city")}
              error={Boolean(errors.city)}
              helperText={errors.city}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField
              label="Country"
              fullWidth
              value={draft.country}
              onChange={handleChange("country")}
              error={Boolean(errors.country)}
              helperText={errors.country}
              required
            />
          </Grid>
          {draft.type === "company" ? (
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Company Name"
                fullWidth
                value={draft.companyName ?? ""}
                onChange={handleChange("companyName")}
                error={Boolean(errors.companyName)}
                helperText={errors.companyName}
                required
              />
            </Grid>
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="First Name"
                  fullWidth
                  value={draft.firstName ?? ""}
                  onChange={handleChange("firstName")}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Last Name"
                  fullWidth
                  value={draft.lastName ?? ""}
                  onChange={handleChange("lastName")}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                  required
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Discard
        </Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

