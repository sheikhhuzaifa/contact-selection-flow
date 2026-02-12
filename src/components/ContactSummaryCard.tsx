import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Chip,
  Button,
  Avatar,
} from "@mui/material";
import { Contact } from "@/types/contact";

interface ContactSummaryCardProps {
  contact: Contact;
  onEdit: () => void;
}

const REQUIRED_FIELDS: Array<keyof Contact> = [
  "name",
  "email",
  "addressLine1",
  "city",
  "country",
];

export function ContactSummaryCard({ contact, onEdit }: ContactSummaryCardProps) {
  const missingFields: string[] = [];

  REQUIRED_FIELDS.forEach((field) => {
    const value = String(contact[field] ?? "").trim();
    if (!value) {
      missingFields.push(field);
    }
  });

  if (contact.type === "company") {
    if (!contact.companyName?.trim()) {
      missingFields.push("companyName");
    }
  } else {
    if (!contact.firstName?.trim()) {
      missingFields.push("firstName");
    }
    if (!contact.lastName?.trim()) {
      missingFields.push("lastName");
    }
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        borderColor: missingFields.length ? "error.light" : "divider",
        bgcolor: "background.paper",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ width: 32, height: 32 }}>
                {(contact.name || "?").charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6">
                {contact.name || "Unnamed"}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {contact.email || "No email"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {contact.addressLine1 && contact.city && contact.country
                ? `${contact.addressLine1}, ${contact.city}, ${contact.country}`
                : "Address incomplete"}
            </Typography>
          </Stack>
          <Chip
            label={contact.type === "company" ? "Company" : "Individual"}
            color="primary"
            variant="outlined"
          />
        </Stack>
        {missingFields.length > 0 && (
          <Typography
            variant="body2"
            sx={{ mt: 2 }}
            color="error"
            data-testid="missing-fields"
          >
            Missing required fields: {missingFields.join(", ")}
          </Typography>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end" }}>
        <Button size="small" onClick={onEdit}>
          Edit
        </Button>
      </CardActions>
    </Card>
  );
}

