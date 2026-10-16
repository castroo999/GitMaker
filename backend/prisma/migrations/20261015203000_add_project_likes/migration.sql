CREATE TABLE "ProjectLike" (
    "projectId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLike_pkey" PRIMARY KEY ("projectId", "userId")
);

CREATE INDEX "ProjectLike_projectId_idx" ON "ProjectLike"("projectId");
CREATE INDEX "ProjectLike_userId_idx" ON "ProjectLike"("userId");

ALTER TABLE "ProjectLike"
ADD CONSTRAINT "ProjectLike_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Project"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ProjectLike"
ADD CONSTRAINT "ProjectLike_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
