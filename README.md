# Fanvue's Fullstack challenge

Setup the project:

Make sure you install all the dependencies (currently pnpm, but you can opt-out) and start the solution in dev mode.

There is a simple homepage that will display a typical "feed" page.

Requirements:

- Use trpc for data fetching and mutations (https://trpc.io/) this is already setup for you.
- Custom styling is not required, you should use MUI5 components out-of-the box, check the docs here https://mui.com/material-ui/
- Fetch the data from the sqlite file that sits in the "prisma" folder, with the prisma library, more info here https://www.prisma.io/docs/orm/overview/databases/sqlite

Note:

- The database is already seeded, but you can add more data if you want to.

Please complete the following tasks:

- Show a centered column of posts which are simple boxes with at least title and content properties, you can aggregate more data where it makes sense.
- For each post, show a button with a counter of the comments, or nothing if there are no comments.
- When clicking on the comment counter, the comments appear below it, you can choose what component to use.
- Although there is no authentication, user can add a comment to a post.

Consider the following, for instance leaving comments close to where this is relevant:

- Scalability of the solution
- Performance
- What Database type would be fit
- How monitoring and logging could be implemented
- SSR and SSG
- Possible infrastructure setup to help with the above

Comment from Artem

Was done:

1. Endpoints for getting a list of posts and comments, considering pagination
2. Loading states with skeletons from @mui/material library
3. A few styles to make it look nice.

I have also added comments on the code, where applicable.

Scalability of the solution

- Using cursor-based pagination which is more efficient than offset pagination
- Limiting result sets to prevent large data transfers

Performance

- Implemented cursor-based pagination to efficiently load posts and comments
- Used React Query (via tRPC) for automatic caching and revalidation
- Implemented loading states to improve perceived performance

What Database type would be fit

- SQLite will be enough for the current solution.
- Consider using a more scalable database like PostgreSQL or MySQL for larger datasets or larger amount of users/actions

How monitoring and logging could be implemented

- Application Monitoring:

  - Implement OpenTelemetry for distributed tracing
  - Use Sentry for error tracking and performance monitoring
  - Set up Prometheus + Grafana for metrics visualization
  - Add New Relic or Datadog for Application Performance Monitoring

- Logging Strategy:

  - Structured logging using Winston or Pino
  - Log levels (ERROR, WARN, INFO, DEBUG) for different environments
  - Centralized log management with ELK Stack (Elasticsearch, Logstash, Kibana)
  - Request ID tracking for request lifecycle tracing

- Key Metrics to Track:

  - API response times and error rates
  - Database query performance
  - Memory usage and CPU utilization
  - Client-side performance metrics (FCP, LCP, TTI)
  - User engagement metrics (page views, interaction rates)

- Alerting:
  - Set up PagerDuty or OpsGenie for critical alerts
  - Define SLOs (Service Level Objectives) and alert thresholds
  - Implement automated incident response procedures

SSR and SSG Implementation

Current Hybrid Approach:

- Initial Post Feed:

  - First 10 posts are pre-rendered using SSG (getStaticProps)
  - Provides instant initial page load
  - Optimizes Core Web Vitals and SEO

- Technical Implementation:
  - Uses Next.js getStaticProps for initial data fetch
  - tRPC queries for client-side pagination
  - Optimistic updates for new comments
  - Revalidation strategy for fresh content

Infrastructure Setup

AWS Setup:

- Lambda functions for API routes OR EBS/K8S
  - The main problem with lambda is the cold start time. Since most of our functionality is given through the endpoint, we need to keep the lambda "warmed up" (provisioned concurrency)
  - In the case of EBS or K8S (Docker image), scalability needs to be provided.
- RDS Aurora for flexible scaling
- CloudFront for CDN
- API Gateway for routing
- S3 for static assets
- CloudWatch for monitoring

If we need to launch as fast as possible, then I would choose Vercel:

1. They are the developers of Next.js, and have prepared an excellent infrastructure for hosting applications.
2. Many different functionality has already been implemented on their side (logging, caching, alerts, deployments)
3. Generous rates

On the cons:

1. We need to provide protection from bots (cloudflare, for example) so that they don't spend all their resources and we don't end up with large invoices.
2. They don't have SQLite or websockets (socket.io) support (what can be used in the future to auto-update posts/comments). (Alternatively, Supabase with realtime feature instead of sockets).
