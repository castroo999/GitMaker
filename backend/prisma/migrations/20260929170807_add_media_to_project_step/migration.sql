-- AlterTable
ALTER TABLE "ProjectMedia" ADD COLUMN     "stepId" INTEGER;

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "ProjectStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;
