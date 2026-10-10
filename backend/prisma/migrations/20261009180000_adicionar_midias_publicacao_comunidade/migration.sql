CREATE TABLE "CommunityPostMedia" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "CommunityPostMedia_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CommunityPostMedia_postId_idx" ON "CommunityPostMedia"("postId");

ALTER TABLE "CommunityPostMedia"
ADD CONSTRAINT "CommunityPostMedia_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
