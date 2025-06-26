const prisma = require("../config/prisma");

exports.createDefaultFeatureSettingsForEvent = async (eventId, userId) => {
  const defaultTabs = [
    { tabName: 'About Event', icon: '\\ue958', filledIcon: '\\ue959', isActive: true, textLabel: '', order: 1 },
    { tabName: 'Agenda', icon: '\\ue96e', filledIcon: '\\ue934', isActive: true, textLabel: '', order: 2 },
    { tabName: 'NewsFeed', icon: '\\ue974', filledIcon: '\\ue973', isActive: true, textLabel: '', order: 3 },
    { tabName: 'Directory', icon: '\\ue93f', filledIcon: '\\ue93e', isActive: true, textLabel: '', order: 4 },
    { tabName: 'Partners', icon: '\\ue97f', filledIcon: '\\ue97e', isActive: true, textLabel: '', order: 5 },
    { tabName: 'Ask', icon: '\\ue98b', filledIcon: '\\ue98c', isActive: true, textLabel: '', order: 6 },
    { tabName: 'Messages', icon: '\\ue941', filledIcon: '\\ue94a', isActive: false, textLabel: '', order: 7 },
  ];

  const featureSettingsData = defaultTabs.map(tab => ({
    EventTabs: tab.tabName,
    icon: tab.icon,
    filledIcon: tab.filledIcon,
    isActive: tab.isActive,
    text: tab.textLabel,
    order: tab.order,
    eventId,
    userId,
  }));

  await prisma.featureTabSetting.createMany({
    data: featureSettingsData,
    skipDuplicates: true,
  });
};
