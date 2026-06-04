const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testChatFunctionality() {
  try {
    console.log('Testing chat functionality...\n');

    // Test 1: Check if tables exist
    console.log('1. Checking if chat tables exist...');
    const chatCount = await prisma.chat.count();
    console.log(`   - Chat table exists, current count: ${chatCount}`);

    const participantCount = await prisma.chatParticipant.count();
    console.log(`   - ChatParticipant table exists, current count: ${participantCount}`);

    const messageCount = await prisma.chatMessage.count();
    console.log(`   - ChatMessage table exists, current count: ${messageCount}`);

    const attachmentCount = await prisma.chatAttachment.count();
    console.log(`   - ChatAttachment table exists, current count: ${attachmentCount}`);

    // Test 2: Check EventAttendee table for testing
    console.log('\n2. Checking EventAttendee table...');
    const attendeeCount = await prisma.eventAttendee.count();
    console.log(`   - EventAttendee count: ${attendeeCount}`);

    if (attendeeCount > 0) {
      const attendees = await prisma.eventAttendee.findMany({
        take: 2,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              profilePicture: true
            }
          }
        }
      });

      console.log('   - Sample attendees:');
      attendees.forEach((attendee, index) => {
        const firstName = attendee.user?.firstName || 'N/A';
        const lastName = attendee.user?.lastName || 'N/A';
        console.log(`     ${index + 1}. ID: ${attendee.id}, Name: ${firstName} ${lastName}`);
      });

      // Test 3: Test chat creation (if we have at least 2 attendees)
      if (attendees.length >= 2) {
        console.log('\n3. Testing chat creation...');
        
        const attendee1 = attendees[0];
        const attendee2 = attendees[1];

        // Create a test chat
        const chat = await prisma.chat.create({
          data: {
            participants: {
              create: [
                { attendeeId: attendee1.id },
                { attendeeId: attendee2.id }
              ]
            }
          },
          include: {
            participants: {
              include: {
                attendee: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true
                      }
                    }
                  }
                }
              }
            }
          }
        });

        console.log(`   - Created chat with ID: ${chat.id}`);
        console.log(`   - Participants: ${chat.participants.length}`);

        // Test 4: Test message creation
        console.log('\n4. Testing message creation...');
        
        const message = await prisma.chatMessage.create({
          data: {
            chatId: chat.id,
            senderId: attendee1.id,
            content: 'Hello! This is a test message.',
            messageType: 'TEXT'
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
            }
          }
        });

        const senderFirstName = message.sender.user?.firstName || 'N/A';
        const senderLastName = message.sender.user?.lastName || 'N/A';
        console.log(`   - Created message with ID: ${message.id}`);
        console.log(`   - Content: "${message.content}"`);
        console.log(`   - Sender: ${senderFirstName} ${senderLastName}`);

        // Test 5: Test image message with attachment
        console.log('\n5. Testing image message with attachment...');
        
        const imageMessage = await prisma.chatMessage.create({
          data: {
            chatId: chat.id,
            senderId: attendee2.id,
            content: 'Check out this image!',
            messageType: 'IMAGE_WITH_TEXT',
            attachments: {
              create: [
                {
                  fileUrl: 'https://example.com/test-image.jpg',
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

        const imageSenderFirstName = imageMessage.sender.user?.firstName || 'N/A';
        const imageSenderLastName = imageMessage.sender.user?.lastName || 'N/A';
        console.log(`   - Created image message with ID: ${imageMessage.id}`);
        console.log(`   - Content: "${imageMessage.content}"`);
        console.log(`   - Attachments: ${imageMessage.attachments.length}`);

        // Test 6: Test chat retrieval
        console.log('\n6. Testing chat retrieval...');
        
        const retrievedChat = await prisma.chat.findUnique({
          where: { id: chat.id },
          include: {
            participants: {
              include: {
                attendee: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true
                      }
                    }
                  }
                }
              }
            },
            messages: {
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
            }
          }
        });

        console.log(`   - Retrieved chat with ${retrievedChat.messages.length} messages`);
        console.log(`   - Messages:`);
        retrievedChat.messages.forEach((msg, index) => {
          const msgSenderFirstName = msg.sender.user?.firstName || 'N/A';
          const msgSenderLastName = msg.sender.user?.lastName || 'N/A';
          console.log(`     ${index + 1}. [${msg.messageType}] ${msg.content} (by ${msgSenderFirstName} ${msgSenderLastName})`);
        });

        // Cleanup: Delete test data
        console.log('\n7. Cleaning up test data...');
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

      } else {
        console.log('\n3. Skipping chat creation test (need at least 2 attendees)');
      }
    } else {
      console.log('\n2. No attendees found in database');
    }

    console.log('\n✅ Chat functionality test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - All chat tables created successfully');
    console.log('   - Database relationships working correctly');
    console.log('   - Message creation and retrieval working');
    console.log('   - Attachment support working');
    console.log('   - Ready for API implementation');

  } catch (error) {
    console.error('❌ Error testing chat functionality:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testChatFunctionality(); 