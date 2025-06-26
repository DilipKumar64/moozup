const prisma = require("../../config/prisma");


const createOrUpdateFeatureSetting = async (data) => {
  return await prisma.featureTabSetting.upsert({
    where: {
      // Unique constraint hona chahiye is combination par — yeh important hai!
      eventId_EventTabs: {
        eventId: data.eventId,
        EventTabs: data.EventTabs,
      },
    },
    update: {
      icon: data.icon,
      filledIcon: data.filledIcon,
      text: data.text,
      isActive: data.isActive,
      order: data.order,
      userId: data.userId,
    },
    create: {
      EventTabs: data.EventTabs,
      icon: data.icon,
      filledIcon: data.filledIcon,
      text: data.text,
      isActive: data.isActive,
      order: data.order,
      eventId: data.eventId,
      userId: data.userId,
    },
  });
};


module.exports = {
  createOrUpdateFeatureSetting
}