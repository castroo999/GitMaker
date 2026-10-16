CREATE TABLE "NotificationPreference" (
    "id" SERIAL NOT NULL,
    "projetos" BOOLEAN NOT NULL DEFAULT true,
    "comunidades" BOOLEAN NOT NULL DEFAULT true,
    "permissoes" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationPreference_userId_key"
ON "NotificationPreference"("userId");

ALTER TABLE "NotificationPreference"
ADD CONSTRAINT "NotificationPreference_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
