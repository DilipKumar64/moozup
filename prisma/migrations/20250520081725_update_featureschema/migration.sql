/*
  Warnings:

  - A unique constraint covering the columns `[eventId,EventTabs]` on the table `FeatureTabSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FeatureTabSetting_eventId_EventTabs_key" ON "FeatureTabSetting"("eventId", "EventTabs");
