const { 
  findOrCreateChat, 
  createMessage, 
  getChatMessages, 
  getAttendeeChats, 
  markMessagesAsRead, 
  getUnreadMessageCount,
  checkAttendeeExists,
  getChattableAttendees
} = require('../models/chat.model');
const { emitChatMessage, emitChatUpdate } = require('../socket');
const uploadToSupabase = require('../utils/uploadToSupabase');

const isIdValid = (id) => {
  return !isNaN(parseInt(id)) && parseInt(id) > 0;
};

// Get all chats for an attendee
exports.getAttendeeChats = async (req, res) => {
  const { attendeeId } = req.params;

  if (!isIdValid(attendeeId)) {
    return res.status(400).json({ error: 'Invalid attendee ID' });
  }

  try {
    // Check if attendee exists
    const attendee = await checkAttendeeExists(Number(attendeeId));
    if (!attendee) {
      return res.status(404).json({ error: 'Attendee not found' });
    }

    const chats = await getAttendeeChats(Number(attendeeId));
    
    // Format the response to include chat partner info
    const formattedChats = chats.map(chat => {
      const otherParticipant = chat.participants.find(p => p.attendeeId !== Number(attendeeId));
      const lastMessage = chat.messages[0];
      
      return {
        chatId: chat.id,
        partner: {
          id: otherParticipant.attendee.id,
          firstName: otherParticipant.attendee.user?.firstName,
          lastName: otherParticipant.attendee.user?.lastName,
          profilePicture: otherParticipant.attendee.user?.profilePicture
        },
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          content: lastMessage.content,
          messageType: lastMessage.messageType,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.senderId,
          attachments: lastMessage.attachments
        } : null,
        updatedAt: chat.updatedAt,
        unreadCount: 0 // This will be calculated separately if needed
      };
    });

    res.json({
      success: true,
      data: formattedChats
    });
  } catch (error) {
    console.error('Error fetching attendee chats:', error);
    res.status(500).json({ error: 'Failed to fetch chats' });
  }
};

// Get messages for a specific chat
exports.getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  const { page = 1, limit = 50, attendeeId } = req.query;
  // const { attendeeId } = req.body; // The attendee requesting the messages

  if (!isIdValid(chatId)) {
    return res.status(400).json({ error: 'Invalid chat ID' });
  }

  if (!isIdValid(attendeeId)) {
    return res.status(400).json({ error: 'Invalid attendee ID' });
  }

  try {
    // Check if attendee exists
    const attendee = await checkAttendeeExists(Number(attendeeId));
    if (!attendee) {
      return res.status(400).json({ error: 'Attendee not found' });
    }

    const result = await getChatMessages(Number(chatId), Number(page), Number(limit));
    
    // Mark messages as read for this attendee
    await markMessagesAsRead(Number(chatId), Number(attendeeId));

    res.json({
      success: true,
      data: result.messages,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content, messageType = 'TEXT', attachments = [] } = req.body;
  console.log(req.body);
  // Validate required fields
  if (!senderId || !receiverId) {
    return res.status(400).json({ error: 'Sender ID and receiver ID are required' });
  }

  if (!isIdValid(senderId) || !isIdValid(receiverId)) {
    return res.status(400).json({ error: 'Invalid attendee IDs' });
  }

  if (senderId === receiverId) {
    return res.status(400).json({ error: 'Cannot send message to yourself' });
  }

  // Validate message content based on type
  if (messageType === 'TEXT' && (!content || content.trim().length === 0)) {
    return res.status(400).json({ error: 'Message content is required for text messages' });
  }

  if (messageType === 'IMAGE' && attachments.length === 0) {
    return res.status(400).json({ error: 'Image attachment is required for image messages. Please upload an image first using /api/chat/upload-image endpoint' });
  }

  if (messageType === 'IMAGE_WITH_TEXT' && attachments.length === 0) {
    return res.status(400).json({ error: 'Image attachment is required for image with text messages. Please upload an image first using /api/chat/upload-image endpoint' });
  }

  // Validate attachments structure
  if (attachments.length > 0) {
    for (const attachment of attachments) {
      if (!attachment.fileUrl || !attachment.fileName || !attachment.fileType) {
        return res.status(400).json({ 
          error: 'Invalid attachment structure. Each attachment must have fileUrl, fileName, and fileType' 
        });
      }
    }
  }

  try {
    // Check if both attendees exist
    const [sender, receiver] = await Promise.all([
      checkAttendeeExists(Number(senderId)),
      checkAttendeeExists(Number(receiverId))
    ]);

    if (!sender) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    if (!receiver) {
      return res.status(404).json({ error: 'Receiver not found' });
    }

    // Find or create chat between the two attendees
    const chat = await findOrCreateChat(Number(senderId), Number(receiverId));

    // Create the message
    const message = await createMessage(
      chat.id,
      Number(senderId),
      content?.trim(),
      messageType,
      attachments
    );

    // Emit the message to both participants via socket
    const messageData = {
      chatId: chat.id,
      id: message.id,
      content: message.content,
      messageType: message.messageType,
      reatedAt: message.createdAt,
      sender: sender,
      attachments: message.attachments,
      ...message,
    };

    // Emit to both participants
    chat.participants.forEach(participant => {
      emitChatMessage(participant.attendeeId, messageData);
    });

    res.status(201).json({
      success: true,
      data: messageData
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Upload chat image
exports.uploadChatImage = async (req, res) => {
  try {
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageFile = req.files.image[0];
    const { chatId } = req.params;
    
    // Validate file size (max 5MB for chat images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageFile.size > maxSize) {
      return res.status(400).json({ error: 'Image file size must be less than 5MB' });
    }

    // Validate chatId
    if (!chatId || !isIdValid(chatId)) {
      return res.status(400).json({ error: 'Valid chatId is required' });
    }

    // Upload to Supabase with chat-specific folder
    const fileUrl = await uploadToSupabase(imageFile, `chat/${chatId}`);

    res.json({
      success: true,
      data: {
        fileUrl: fileUrl,
        fileName: imageFile.originalname,
        fileType: imageFile.mimetype,
        fileSize: imageFile.size
      }
    });
  } catch (error) {
    console.error('Error uploading chat image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  const { chatId, attendeeId } = req.body;

  if (!isIdValid(chatId) || !isIdValid(attendeeId)) {
    return res.status(400).json({ error: 'Invalid chat ID or attendee ID' });
  }

  try {
    // Check if attendee exists
    const attendee = await checkAttendeeExists(Number(attendeeId));
    if (!attendee) {
      return res.status(404).json({ error: 'Attendee not found' });
    }

    await markMessagesAsRead(Number(chatId), Number(attendeeId));

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
};

// Get unread message count for an attendee
exports.getUnreadMessageCount = async (req, res) => {
  const { attendeeId } = req.params;

  if (!isIdValid(attendeeId)) {
    return res.status(400).json({ error: 'Invalid attendee ID' });
  }

  try {
    // Check if attendee exists
    const attendee = await checkAttendeeExists(Number(attendeeId));
    if (!attendee) {
      return res.status(404).json({ error: 'Attendee not found' });
    }

    const count = await getUnreadMessageCount(Number(attendeeId));

    res.json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Error fetching unread message count:', error);
    res.status(500).json({ error: 'Failed to fetch unread message count' });
  }
};

// Get attendees that can be chatted with
exports.getChattableAttendees = async (req, res) => {
  const { eventId, currentAttendeeId, search } = req.query;

  // Validate required parameters
  if (!eventId || !currentAttendeeId) {
    return res.status(400).json({ 
      error: 'Both eventId and currentAttendeeId are required' 
    });
  }

  if (!isIdValid(eventId) || !isIdValid(currentAttendeeId)) {
    return res.status(400).json({ error: 'Invalid eventId or currentAttendeeId' });
  }

  try {
    // Check if current attendee exists
    const currentAttendee = await checkAttendeeExists(Number(currentAttendeeId));
    if (!currentAttendee) {
      return res.status(404).json({ error: 'Current attendee not found' });
    }

    // Get chattable attendees with optional search
    const attendees = await getChattableAttendees(Number(eventId), Number(currentAttendeeId), search);

    res.json({
      success: true,
      data: {
        attendees,
        count: attendees.length,
        searchQuery: search || null
      }
    });
  } catch (error) {
    console.error('Error fetching chattable attendees:', error);
    res.status(500).json({ error: 'Failed to fetch chattable attendees' });
  }
}; 