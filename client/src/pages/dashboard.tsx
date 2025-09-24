import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { 
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer
} from "recharts";

interface AnalyticsData {
  overview: {
    totalContacts: number;
    totalChatMessages: number;
    uniqueChatSessions: number;
    unknownQuestions: number;
  };
  growth: {
    contactsThisWeek: number;
    contactsLastWeek: number;
    contactGrowth: number;
  };
  recentActivity: {
    contacts: Array<{
      id: string;
      name: string;
      email: string;
      message: string;
      timestamp: string;
    }>;
    unknownQuestions: Array<{
      id: string;
      question: string;
      timestamp: string;
    }>;
  };
}

interface ContactAnalytics {
  totalContacts: number;
  timeSeries: Array<{
    date: string;
    count: number;
  }>;
  recentContacts: Array<{
    id: string;
    name: string;
    email: string;
    message: string;
    timestamp: string;
  }>;
}

export default function Dashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics/dashboard'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: contactData, isLoading: contactLoading } = useQuery<ContactAnalytics>({
    queryKey: ['/api/analytics/contacts'],
    refetchInterval: 30000,
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground" data-testid="text-dashboard-title">
                Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1" data-testid="text-dashboard-subtitle">
                Track engagement and conversation analytics
              </p>
            </div>
            <Link href="/" className="text-primary hover:underline" data-testid="link-home">
              ← Back to Portfolio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))
          ) : (
            <>
              <Card data-testid="card-total-contacts">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Contacts
                  </CardTitle>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.overview.totalContacts ?? 0}
                  </div>
                </CardHeader>
              </Card>

              <Card data-testid="card-chat-sessions">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Chat Sessions
                  </CardTitle>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.overview.uniqueChatSessions ?? 0}
                  </div>
                </CardHeader>
              </Card>

              <Card data-testid="card-chat-messages">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Chat Messages
                  </CardTitle>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.overview.totalChatMessages ?? 0}
                  </div>
                </CardHeader>
              </Card>

              <Card data-testid="card-unknown-questions">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Unknown Questions
                  </CardTitle>
                  <div className="text-2xl font-bold text-foreground">
                    {dashboardData?.overview.unknownQuestions ?? 0}
                  </div>
                </CardHeader>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Growth Chart */}
          <Card data-testid="card-contact-chart">
            <CardHeader>
              <CardTitle className="text-foreground">Contact Growth</CardTitle>
              <CardDescription>
                Contact submissions over the last 30 days
              </CardDescription>
              {!contactLoading && dashboardData?.growth && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant={dashboardData.growth.contactGrowth > 0 ? "default" : "secondary"}
                    data-testid="badge-growth"
                  >
                    {dashboardData.growth.contactGrowth > 0 ? "+" : ""}{dashboardData.growth.contactGrowth} this week
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {contactLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ChartContainer
                  config={{
                    count: {
                      label: "Contacts",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="h-64"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={contactData?.timeSeries ?? []}>
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card data-testid="card-recent-activity">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription>
                Latest contact submissions and interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboardData?.recentActivity.contacts.length === 0 ? (
                    <p className="text-muted-foreground text-sm" data-testid="text-no-contacts">
                      No recent contacts
                    </p>
                  ) : (
                    dashboardData?.recentActivity.contacts.map((contact) => (
                      <div 
                        key={contact.id} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        data-testid={`contact-item-${contact.id}`}
                      >
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                          {contact.name ? 
                            contact.name.charAt(0).toUpperCase() : 
                            contact.email.charAt(0).toUpperCase()
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground truncate">
                              {contact.name || contact.email}
                            </h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {formatDateTime(contact.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.email}
                          </p>
                          <p className="text-sm text-foreground mt-1 line-clamp-2">
                            {contact.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}