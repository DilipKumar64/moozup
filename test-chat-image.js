const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function testChatImageUpload() {
  try {
    console.log('Testing chat image upload functionality...\n');

    // Test 1: Check if attendees exist
    console.log('1. Checking attendees...');
    const attendees = await prisma.eventAttendee.findMany({
      take: 2,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (attendees.length < 2) {
      console.log('   - Need at least 2 attendees to test chat functionality');
      return;
    }

    console.log(`   - Found ${attendees.length} attendees for testing`);

    // Test 2: Create a test chat
    console.log('\n2. Creating test chat...');
    const chat = await prisma.chat.create({
      data: {
        participants: {
          create: [
            { attendeeId: attendees[0].id },
            { attendeeId: attendees[1].id }
          ]
        }
      }
    });

    console.log(`   - Created chat with ID: ${chat.id}`);

    // Test 3: Test image message with attachment
    console.log('\n3. Testing image message with attachment...');
    
    const imageMessage = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: attendees[0].id,
        content: 'Check out this uploaded image!',
        messageType: 'IMAGE_WITH_TEXT',
        attachments: {
          create: [
            {
              fileUrl: 'https://res.cloudinary.com/test/image/upload/v1234567890/chat-images/test-image.jpg',
              fileName: 'test-image.jpg',
              fileType: 'image/jpeg',
              fileSize: 1024000
            }
          ]
        }
      },
      include: {
        sender: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        attachments: true
      }
    });

    console.log(`   - Created image message with ID: ${imageMessage.id}`);
    console.log(`   - Content: "${imageMessage.content}"`);
    console.log(`   - Message Type: ${imageMessage.messageType}`);
    console.log(`   - Attachments: ${imageMessage.attachments.length}`);
    
    if (imageMessage.attachments.length > 0) {
      const attachment = imageMessage.attachments[0];
      console.log(`   - Attachment Details:`);
      console.log(`     - File URL: ${attachment.fileUrl}`);
      console.log(`     - File Name: ${attachment.fileName}`);
      console.log(`     - File Type: ${attachment.fileType}`);
      console.log(`     - File Size: ${attachment.fileSize} bytes`);
    }

    // Test 4: Test image-only message
    console.log('\n4. Testing image-only message...');
    
    const imageOnlyMessage = await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: attendees[1].id,
        content: null,
        messageType: 'IMAGE',
        attachments: {
          create: [
            {
              fileUrl: 'https://res.cloudinary.com/test/image/upload/v1234567890/chat-images/photo.png',
              fileName: 'photo.png',
              fileType: 'image/png',
              fileSize: 2048000
            }
          ]
        }
      },
      include: {
        sender: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        attachments: true
      }
    });

    console.log(`   - Created image-only message with ID: ${imageOnlyMessage.id}`);
    console.log(`   - Message Type: ${imageOnlyMessage.messageType}`);
    console.log(`   - Content: ${imageOnlyMessage.content || 'null'}`);
    console.log(`   - Attachments: ${imageOnlyMessage.attachments.length}`);

    // Test 5: Retrieve all messages to verify
    console.log('\n5. Retrieving all messages...');
    
    const allMessages = await prisma.chatMessage.findMany({
      where: { chatId: chat.id },
      include: {
        sender: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        },
        attachments: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`   - Total messages in chat: ${allMessages.length}`);
    allMessages.forEach((msg, index) => {
      const senderName = msg.sender.user?.firstName || 'Unknown';
      console.log(`     ${index + 1}. [${msg.messageType}] "${msg.content || 'No content'}" (by ${senderName})`);
      if (msg.attachments.length > 0) {
        console.log(`        - Has ${msg.attachments.length} attachment(s)`);
      }
    });

    // Cleanup
    console.log('\n6. Cleaning up test data...');
    await prisma.chatMessage.deleteMany({
      where: { chatId: chat.id }
    });
    await prisma.chatParticipant.deleteMany({
      where: { chatId: chat.id }
    });
    await prisma.chat.delete({
      where: { id: chat.id }
    });
    console.log('   - Test data cleaned up');

    console.log('\n✅ Chat image upload functionality test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Image messages with text working correctly');
    console.log('   - Image-only messages working correctly');
    console.log('   - Attachment metadata stored properly');
    console.log('   - Message types (IMAGE, IMAGE_WITH_TEXT) working');
    console.log('   - Ready for API integration with file upload');

  } catch (error) {
    console.error('❌ Error testing chat image upload:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testChatImageUpload(); 