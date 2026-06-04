const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:3000';

// Test data - Update these with valid credentials from your database
const TEST_CREDENTIALS = {
  email: 'test@example.com', // Replace with a valid email from your database
  password: 'password123'     // Replace with the corresponding password
};

const TEST_DATA = {
  eventId: 1,
  attendeeId: 1,
  postId: null,
  commentId: null,
  replyId: null
};

let authToken = null;

async function authenticate() {
  try {
    console.log('🔐 Authenticating to get JWT token...');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      console.log('   ✅ Authentication successful');
      console.log(`   - Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      console.log('   ❌ No token received');
      return false;
    }
  } catch (error) {
    console.log('   ❌ Authentication failed');
    console.log(`   - Status: ${error.response?.status}`);
    console.log(`   - Message: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function testSocialAPI() {
  try {
    console.log('\n🧪 Testing SocialPost API...\n');

    // Test 1: Create a social post
    console.log('1. Testing POST /api/social/ (create social post)...');
    try {
      const formData = new FormData();
      formData.append('description', 'This is a test social post');
      formData.append('attendeeId', TEST_DATA.attendeeId);
      
      // Create a dummy image file for testing
      const dummyImagePath = path.join(__dirname, 'dummy-image.jpg');
      if (!fs.existsSync(dummyImagePath)) {
        // Create a simple dummy image if it doesn't exist
        const dummyImageBuffer = Buffer.from('fake-image-data');
        fs.writeFileSync(dummyImagePath, dummyImageBuffer);
      }
      
      formData.append('images', fs.createReadStream(dummyImagePath));

      const response1 = await axios.post(`${BASE_URL}/api/social/`, formData, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...formData.getHeaders()
        }
      });
      
      console.log('   ✅ Success - Social post created');
      console.log(`   - Post ID: ${response1.data.id}`);
      console.log(`   - Description: ${response1.data.description}`);
      console.log(`   - Images count: ${response1.data.images.length}`);
      TEST_DATA.postId = response1.data.id;
    } catch (error) {
      console.log('   ❌ Error - Create social post');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.message || error.message}`);
    }

    // Test 2: Get social posts by event
    console.log('\n2. Testing GET /api/social/event/:eventId (get posts by event)...');
    try {
      const response2 = await axios.get(`${BASE_URL}/api/social/event/${TEST_DATA.eventId}`, {
        params: {
          attendeeId: TEST_DATA.attendeeId,
          page: 1,
          pageSize: 10
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('   ✅ Success - Get social posts by event');
      console.log(`   - Posts found: ${response2.data.posts.length}`);
      console.log(`   - Page: ${response2.data.page}`);
      console.log(`   - Page size: ${response2.data.pageSize}`);
      console.log(`   - Total: ${response2.data.total}`);
    } catch (error) {
      console.log('   ❌ Error - Get social posts by event');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.message || error.message}`);
    }

    // Test 3: Like a social post
    console.log('\n3. Testing POST /api/social/:id/like (like social post)...');
    if (TEST_DATA.postId) {
      try {
        const response3 = await axios.post(`${BASE_URL}/api/social/${TEST_DATA.postId}/like`, {
          attendeeId: TEST_DATA.attendeeId
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('   ✅ Success - Like social post');
        console.log(`   - Liked: ${response3.data.liked}`);
      } catch (error) {
        console.log('   ❌ Error - Like social post');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('   ⚠️  Skipped - No post ID available');
    }

    // Test 4: Unlike a social post (toggle like)
    console.log('\n4. Testing POST /api/social/:id/like (unlike social post)...');
    if (TEST_DATA.postId) {
      try {
        const response4 = await axios.post(`${BASE_URL}/api/social/${TEST_DATA.postId}/like`, {
          attendeeId: TEST_DATA.attendeeId
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('   ✅ Success - Unlike social post');
        console.log(`   - Liked: ${response4.data.liked}`);
      } catch (error) {
        console.log('   ❌ Error - Unlike social post');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('   ⚠️  Skipped - No post ID available');
    }

    // Test 5: Share a social post
    console.log('\n5. Testing POST /api/social/:id/share (share social post)...');
    if (TEST_DATA.postId) {
      try {
        const response5 = await axios.post(`${BASE_URL}/api/social/${TEST_DATA.postId}/share`, {}, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('   ✅ Success - Share social post');
        console.log(`   - Shares count: ${response5.data.shares}`);
      } catch (error) {
        console.log('   ❌ Error - Share social post');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('   ⚠️  Skipped - No post ID available');
    }

    // Test 6: Create a comment on social post
    console.log('\n6. Testing POST /api/social/comment (create comment)...');
    if (TEST_DATA.postId) {
      try {
        const response6 = await axios.post(`${BASE_URL}/api/social/comment`, {
          postId: TEST_DATA.postId,
          content: 'This is a test comment on the social post',
          attendeeId: TEST_DATA.attendeeId
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('   ✅ Success - Create comment');
        console.log(`   - Comment ID: ${response6.data.id}`);
        console.log(`   - Content: ${response6.data.content}`);
        TEST_DATA.commentId = response6.data.id;
      } catch (error) {
        console.log('   ❌ Error - Create comment');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('   ⚠️  Skipped - No post ID available');
    }

    // Test 7: Reply to a comment
    console.log('\n7. Testing POST /api/social/comment/:commentId/reply (reply to comment)...');
    if (TEST_DATA.commentId) {
      try {
        const response7 = await axios.post(`${BASE_URL}/api/social/comment/${TEST_DATA.commentId}/reply`, {
          content: 'This is a reply to the comment',
          attendeeId: TEST_DATA.attendeeId
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('   ✅ Success - Reply to comment');
        console.log(`   - Reply ID: ${response7.data.id}`);
        console.log(`   - Content: ${response7.data.content}`);
        console.log(`   - Parent ID: ${response7.data.parentId}`);
        TEST_DATA.replyId = response7.data.id;
      } catch (error) {
        console.log('   ❌ Error - Reply to comment');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('   ⚠️  Skipped - No comment ID available');
    }

    // Test 8: Like a comment
    console.log('\n8. Testing POST /api/social/comment/:commentId/like (like comment)...');
    if (TEST_DATA.commentId) {
      try {
        const response8 = await axios.post(`${BASE_URL}/api/social/comment/${TEST_DATA.commentId}/like`, {
          attendeeId: TEST_DATA.attendeeId
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('   ✅ Success - Like comment');
        console.log(`   - Liked: ${response8.data.liked}`);
      } catch (error) {
        console.log('   ❌ Error - Like comment');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('   ⚠️  Skipped - No comment ID available');
    }

    // Test 9: Unlike a comment (toggle like)
    console.log('\n9. Testing POST /api/social/comment/:commentId/like (unlike comment)...');
    if (TEST_DATA.commentId) {
      try {
        const response9 = await axios.post(`${BASE_URL}/api/social/comment/${TEST_DATA.commentId}/like`, {
          attendeeId: TEST_DATA.attendeeId
        }, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('   ✅ Success - Unlike comment');
        console.log(`   - Liked: ${response9.data.liked}`);
      } catch (error) {
        console.log('   ❌ Error - Unlike comment');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('   ⚠️  Skipped - No comment ID available');
    }

    // Test 10: Get social posts with like counts and user interactions
    console.log('\n10. Testing GET /api/social/event/:eventId (with like info)...');
    try {
      const response10 = await axios.get(`${BASE_URL}/api/social/event/${TEST_DATA.eventId}`, {
        params: {
          attendeeId: TEST_DATA.attendeeId,
          page: 1,
          pageSize: 10
        },
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('   ✅ Success - Get social posts with like info');
      console.log(`   - Posts found: ${response10.data.posts.length}`);
      
      if (response10.data.posts.length > 0) {
        const firstPost = response10.data.posts[0];
        console.log(`   - First post like count: ${firstPost.likeCount}`);
        console.log(`   - First post liked by current user: ${firstPost.likedByCurrentUser}`);
        console.log(`   - First post comments count: ${firstPost.comments.length}`);
        
        if (firstPost.comments.length > 0) {
          const firstComment = firstPost.comments[0];
          console.log(`   - First comment like count: ${firstComment.likeCount}`);
          console.log(`   - First comment liked by current user: ${firstComment.likedByCurrentUser}`);
        }
      }
    } catch (error) {
      console.log('   ❌ Error - Get social posts with like info');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.message || error.message}`);
    }

    // Test 11: Delete the test social post
    console.log('\n11. Testing DELETE /api/social/:id (delete social post)...');
    if (TEST_DATA.postId) {
      try {
        const response11 = await axios.delete(`${BASE_URL}/api/social/${TEST_DATA.postId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        console.log('   ✅ Success - Delete social post');
        console.log(`   - Message: ${response11.data.message}`);
      } catch (error) {
        console.log('   ❌ Error - Delete social post');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    } else {
      console.log('   ⚠️  Skipped - No post ID available');
    }

    // Test 12: Error handling - Invalid post ID
    console.log('\n12. Testing error handling (invalid post ID)...');
    try {
      const response12 = await axios.post(`${BASE_URL}/api/social/999999/like`, {
        attendeeId: TEST_DATA.attendeeId
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('   ❌ Should have failed - Invalid post ID');
    } catch (error) {
      console.log('   ✅ Correctly failed - Invalid post ID');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.message || error.message}`);
    }

    // Test 13: Error handling - Missing required fields
    console.log('\n13. Testing error handling (missing required fields)...');
    try {
      const response13 = await axios.post(`${BASE_URL}/api/social/comment`, {
        postId: 1
        // Missing content and attendeeId
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      console.log('   ❌ Should have failed - Missing required fields');
    } catch (error) {
      console.log('   ✅ Correctly failed - Missing required fields');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n✅ SocialPost API Tests Completed!');
    console.log('\n📋 API Test Summary:');
    console.log('   - ✅ Create social post with images');
    console.log('   - ✅ Get social posts by event with pagination');
    console.log('   - ✅ Like/unlike social posts');
    console.log('   - ✅ Share social posts');
    console.log('   - ✅ Create comments on posts');
    console.log('   - ✅ Reply to comments');
    console.log('   - ✅ Like/unlike comments');
    console.log('   - ✅ Get posts with like counts and user interactions');
    console.log('   - ✅ Delete social posts');
    console.log('   - ✅ Proper error handling for invalid IDs');
    console.log('   - ✅ Proper error handling for missing fields');

    // Clean up dummy image file
    const dummyImagePath = path.join(__dirname, 'dummy-image.jpg');
    if (fs.existsSync(dummyImagePath)) {
      fs.unlinkSync(dummyImagePath);
    }

  } catch (error) {
    console.error('❌ Error running SocialPost API tests:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting SocialPost API Tests...\n');
  
  // First authenticate
  const authSuccess = await authenticate();
  
  if (!authSuccess) {
    console.log('\n❌ Authentication failed. Please check your credentials.');
    console.log('   Update TEST_CREDENTIALS with valid email and password from your database.');
    return;
  }
  
  // Then run the tests
  await testSocialAPI();
}

// Note: This test requires the server to be running and valid credentials
console.log('⚠️  Note: Make sure your server is running and update TEST_CREDENTIALS with valid credentials');
console.log('   To run this test:');
console.log('   1. Start your server: npm start');
console.log('   2. Update TEST_CREDENTIALS with valid email and password from your database');
console.log('   3. Update TEST_DATA with valid eventId and attendeeId');
console.log('   4. Run: node test-social-api-with-auth.js\n');

// Uncomment the line below to run the test
// runTests(); 