import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import api from "../services/api";

const COLORS = ["#f44336", "#ff9800", "#ffc107", "#4caf50", "#2196f3"];

function Dashboard() {
  const [riskScore, setRiskScore] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [driftEvents, setDriftEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [riskRes, metricsRes, driftRes] = await Promise.all([
        api.getRiskScore(),
        api.getMetrics(),
        api.getDriftEvents(10),
      ]);
      setRiskScore(riskRes.data);
      setMetrics(metricsRes.data);
      setDriftEvents(driftRes.data.events || []);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score < 20) return "#4caf50";
    if (score < 40) return "#8bc34a";
    if (score < 60) return "#ffc107";
    if (score < 80) return "#ff9800";
    return "#f44336";
  };

  const getRiskLabel = (level) => {
    const labels = {
      low: { color: "success", icon: <CheckCircleIcon /> },
      moderate: { color: "info", icon: <SecurityIcon /> },
      elevated: { color: "warning", icon: <WarningIcon /> },
      high: { color: "error", icon: <ErrorIcon /> },
      critical: { color: "error", icon: <ErrorIcon /> },
    };
    return labels[level] || labels.moderate;
  };

  // Mock historical data for charts
  const riskTrendData = [
    { time: "6h ago", score: 45 },
    { time: "5h ago", score: 42 },
    { time: "4h ago", score: 48 },
    { time: "3h ago", score: 40 },
    { time: "2h ago", score: 35 },
    { time: "1h ago", score: 32 },
    { time: "Now", score: riskScore?.overall_score || 30 },
  ];

  const severityData = [
    {
      name: "Critical",
      value: driftEvents.filter((e) => e.severity === "critical").length || 2,
    },
    {
      name: "High",
      value: driftEvents.filter((e) => e.severity === "high").length || 5,
    },
    {
      name: "Medium",
      value: driftEvents.filter((e) => e.severity === "medium").length || 8,
    },
    {
      name: "Low",
      value: driftEvents.filter((e) => e.severity === "low").length || 15,
    },
    {
      name: "Info",
      value: driftEvents.filter((e) => e.severity === "info").length || 20,
    },
  ];

  if (loading) {
    return (
      <Box sx={{ width: "100%" }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Security Dashboard
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={fetchData} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Risk Score Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: "rgba(255,255,255,0.9)" }}
                >
                  Security Risk Score
                </Typography>
                {riskScore?.risk_level && (
                  <Chip
                    label={riskScore.risk_level.toUpperCase()}
                    color={getRiskLabel(riskScore.risk_level).color}
                    size="small"
                    icon={getRiskLabel(riskScore.risk_level).icon}
                  />
                )}
              </Box>
              <Box sx={{ display: "flex", alignItems: "baseline", mt: 2 }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: getRiskColor(riskScore?.overall_score || 0),
                  }}
                >
                  {riskScore?.overall_score?.toFixed(1) || "0.0"}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ ml: 1, color: "rgba(255,255,255,0.7)" }}
                >
                  / 100
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {riskScore?.trend?.direction === "improving" ? (
                  <TrendingDownIcon sx={{ color: "#4caf50", mr: 0.5 }} />
                ) : (
                  <TrendingUpIcon sx={{ color: "#f44336", mr: 0.5 }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color:
                      riskScore?.trend?.direction === "improving"
                        ? "#4caf50"
                        : "#f44336",
                  }}
                >
                  {Math.abs(riskScore?.trend?.change_24h || 0).toFixed(1)}% from
                  yesterday
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metrics Cards */}
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Active Policies
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "primary.main", mt: 1 }}
                  >
                    {metrics?.policies_total || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Deployed
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "success.main", mt: 1 }}
                  >
                    {metrics?.policies_deployed || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Drift Events (24h)
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "warning.main", mt: 1 }}
                  >
                    {metrics?.drift_events_24h || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Critical Alerts
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "error.main", mt: 1 }}
                  >
                    {
                      driftEvents.filter((e) => e.severity === "critical")
                        .length
                    }
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Risk Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Risk Score Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="time" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" domain={[0, 100]} />
                  <ChartTooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "none",
                      borderRadius: 8,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#90caf9"
                    fill="url(#colorScore)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#90caf9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#90caf9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Severity Distribution */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Events by Severity
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  justifyContent: "center",
                }}
              >
                {severityData.map((entry, index) => (
                  <Chip
                    key={entry.name}
                    label={`${entry.name}: ${entry.value}`}
                    size="small"
                    sx={{ backgroundColor: COLORS[index], color: "#fff" }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Drift Events */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Drift Events
              </Typography>
              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom: "1px solid #374151",
                        }}
                      >
                        Time
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom: "1px solid #374151",
                        }}
                      >
                        Type
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom: "1px solid #374151",
                        }}
                      >
                        Source
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom: "1px solid #374151",
                        }}
                      >
                        Destination
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom: "1px solid #374151",
                        }}
                      >
                        Severity
                      </th>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                          borderBottom: "1px solid #374151",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {driftEvents.slice(0, 5).map((event, index) => (
                      <tr key={event.id || index}>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #1f2937",
                          }}
                        >
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #1f2937",
                          }}
                        >
                          {event.event_type}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #1f2937",
                          }}
                        >
                          {event.source_pod}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #1f2937",
                          }}
                        >
                          {event.destination_pod}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #1f2937",
                          }}
                        >
                          <Chip
                            label={event.severity}
                            size="small"
                            color={
                              event.severity === "critical"
                                ? "error"
                                : event.severity === "high"
                                  ? "error"
                                  : event.severity === "medium"
                                    ? "warning"
                                    : "success"
                            }
                          />
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #1f2937",
                          }}
                        >
                          {event.action}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
