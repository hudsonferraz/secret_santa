-- Initial schema for secret_santa.
-- For existing databases already created with `prisma db push`, mark this migration
-- as applied instead of running it: `npm run db:migrate:resolve -- 20250630153000_init`

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Organizer" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organizer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "id_organizer" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "grouped" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventGroup" (
    "id" SERIAL NOT NULL,
    "id_event" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EventGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventPeople" (
    "id" SERIAL NOT NULL,
    "id_event" INTEGER NOT NULL,
    "id_group" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" TEXT,
    "reveal_token" TEXT NOT NULL,
    "matched_person_id" INTEGER,
    "link_sent" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EventPeople_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organizer_email_key" ON "Organizer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "EventPeople_reveal_token_key" ON "EventPeople"("reveal_token");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_id_organizer_fkey" FOREIGN KEY ("id_organizer") REFERENCES "Organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventGroup" ADD CONSTRAINT "EventGroup_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPeople" ADD CONSTRAINT "EventPeople_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPeople" ADD CONSTRAINT "EventPeople_id_group_fkey" FOREIGN KEY ("id_group") REFERENCES "EventGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventPeople" ADD CONSTRAINT "EventPeople_matched_person_id_fkey" FOREIGN KEY ("matched_person_id") REFERENCES "EventPeople"("id") ON DELETE SET NULL ON UPDATE CASCADE;
