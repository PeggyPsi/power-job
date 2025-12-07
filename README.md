## Getting Started

```bash
docker-compose up build # to run all the appropriate containers related to the application
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Db Migration

To initialize the database you need to create and run a migration file of the DB schema.
Run the following commands to generate it and apply it.

!IMPORTANT: make sure that postgresql is up and running. You have to run `docker-compose up build` to run it

```bash
# make sure to run the following commands from the root folder
chmod +x ./src/drizzle/generate-migration.js # make the generator js file executable
npm run db:generate <migration_name> # creates a timestamped migration file inside ./src/drizzle/migrations. See drizzle-config.ts "out" param for more information
npm run db:migrate # apply latest pending migrations
npm run db:studio # (optional) open drizzle studio in a UI interface to checkout the DB
```
