import {
  Paper,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTenant } from "../contexts/TenantContext";

interface Job {
  id: string;
  name: string;
  createdDate: string;
  scheduledDate: string;
  status: "completed" | "scheduled" | "failed";
  tags: string[];
  tenantId: string;
}

export default function StatusPage() {
  const { tenant } = useTenant();
  // Mock data - in a real app, this would come from an API
  const mockRequests: Job[] = [
    {
      id: "1",
      name: "Database Migration Request",
      status: "completed",
      createdDate: "2024-01-15T10:30:00Z",
      scheduledDate: "2024-01-15T14:45:00Z",
      tags: [],
      tenantId: "filip",
    },
    {
      id: "2",
      name: "API Integration Request",
      status: "scheduled",
      createdDate: "2024-01-16T09:15:00Z",
      scheduledDate: "2024-01-16T11:20:00Z",
      tags: [],
      tenantId: "filip",
    },
    {
      id: "3",
      name: "Security Audit Request",
      status: "scheduled",
      createdDate: "2024-01-17T08:00:00Z",
      scheduledDate: "2024-01-17T08:00:00Z",
      tags: [],
      tenantId: "filip",
    },
  ];

  const getStatusColor = (status: Job["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "scheduled":
        return "warning";
      case "failed":
        return "error";
      default:
        return "default";
    }
  };

  if (!tenant) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Invalid Tenant
        </Typography>
        <Typography variant="body1">
          Please navigate to a valid tenant page.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Status Page for {tenant}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        View the status of your requests for tenant: {tenant}
      </Typography>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Executed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.id}</TableCell>
                <TableCell>{request.name}</TableCell>
                <TableCell>
                  <Chip
                    label={request.status}
                    color={getStatusColor(request.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(request.createdDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(request.scheduledDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
