import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Chip,
  Button,
} from "@mui/material";
import { Contact } from "@/types/contact";

interface ContactSummaryCardProps {
  contact: Contact;
  onEdit: () => void;
  onCreateNew: () => void;
}

const REQUIRED_FIELDS: Array<keyof Contact> = [
  "name",
  "email",
  "addressLine1",
  "city",
  "country",
];

export function ContactSummaryCard({
  contact,
  onEdit,
  onCreateNew,
}: ContactSummaryCardProps) {
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
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Stack spacing={0.5}>
            <Typography variant="h6">{contact.name || "Unnamed"}</Typography>
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
        <Button size="small" onClick={onCreateNew} variant="outlined">
          Create New
        </Button>
      </CardActions>
    </Card>
  );
}

