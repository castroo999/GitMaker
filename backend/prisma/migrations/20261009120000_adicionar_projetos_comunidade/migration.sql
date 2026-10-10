ALTER TABLE "Project" ADD COLUMN "communityId" INTEGER;

CREATE INDEX "Project_communityId_idx" ON "Project"("communityId");

ALTER TABLE "Project"
ADD CONSTRAINT "Project_communityId_fkey"
FOREIGN KEY ("communityId") REFERENCES "Community"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
