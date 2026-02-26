# Power Job App

A full-stack job application tracker built with Next.js, helping users manage their job search by organizing listings, tracking applications, and leveraging AI-powered resume insights.

## Getting Started

```bash
docker-compose up # to run all the appropriate containers related to the application
#(or `docker compose up` for linux/ubuntu)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Db Migration

To initialize the database you need to create and run a migration file of the DB schema.
Run the following commands to generate it and apply it.

!IMPORTANT: make sure that postgresql is up and running. You have to run `docker-compose up` (or `docker compose up` for linux/ubuntu) to run it

```bash
# make sure to run the following commands from the root folder
chmod +x ./src/drizzle/generate-migration.js # make the generator js file executable
npm run db:generate <migration_name> # creates a timestamped migration file inside ./src/drizzle/migrations. See drizzle-config.ts "out" param for more information
npm run db:migrate # apply latest pending migrations
npm run db:studio # (optional) open drizzle studio in a UI interface to checkout the DB
```

# Styling

The project uses [shadcn](https://ui.shadcn.com) library for the components and the whole styling.

# Authentication

[Clerk](https://clerk.com/) is used as the authentication middleware of the application.

# Icons

Use of [Lucide](https://lucide.dev/) library.

# Inngest

The project uses Inngest to ...
To run the Inngest server run the following command

```bash
npm install -g inngest-cli # to globally instal the inngest-cli
npm run inngest
```

Ingest local dev server runs on http://localhost:8288/
For the cloud server go to https://app.inngest.com/env/production/apps
