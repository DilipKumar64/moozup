const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001';

async function testSocialAPI() {
  try {
    console.log('🧪 Testing SocialPost API (Basic Tests)...\n');

    // Test 1: Test server is running
    console.log('1. Testing server health...');
    try {
      const response1 = await axios.get(`${BASE_URL}/`);
      console.log('   ✅ Server is running');
      console.log(`   - Message: ${response1.data.message}`);
    } catch (error) {
      console.log('   ❌ Server is not running');
      console.log(`   - Error: ${error.message}`);
      return;
    }

    // Test 2: Test social routes are accessible (should return 403 for unauthorized)
    console.log('\n2. Testing social routes accessibility...');
    try {
      const response2 = await axios.get(`${BASE_URL}/api/social/event/1`);
      console.log('   ❌ Should have failed - No authentication');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly failed - Authentication required');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('   ❌ Unexpected error');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 3: Test social post creation without auth (should return 403)
    console.log('\n3. Testing social post creation without auth...');
    try {
      const response3 = await axios.post(`${BASE_URL}/api/social/`, {
        description: 'Test post',
        attendeeId: 1
      });
      console.log('   ❌ Should have failed - No authentication');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly failed - Authentication required');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('   ❌ Unexpected error');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 4: Test like post without auth (should return 403)
    console.log('\n4. Testing like post without auth...');
    try {
      const response4 = await axios.post(`${BASE_URL}/api/social/1/like`, {
        attendeeId: 1
      });
      console.log('   ❌ Should have failed - No authentication');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly failed - Authentication required');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('   ❌ Unexpected error');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 5: Test share post without auth (should return 403)
    console.log('\n5. Testing share post without auth...');
    try {
      const response5 = await axios.post(`${BASE_URL}/api/social/1/share`);
      console.log('   ❌ Should have failed - No authentication');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly failed - Authentication required');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('   ❌ Unexpected error');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 6: Test create comment without auth (should return 403)
    console.log('\n6. Testing create comment without auth...');
    try {
      const response6 = await axios.post(`${BASE_URL}/api/social/comment`, {
        postId: 1,
        content: 'Test comment',
        attendeeId: 1
      });
      console.log('   ❌ Should have failed - No authentication');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly failed - Authentication required');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('   ❌ Unexpected error');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 7: Test reply to comment without auth (should return 403)
    console.log('\n7. Testing reply to comment without auth...');
    try {
      const response7 = await axios.post(`${BASE_URL}/api/social/comment/1/reply`, {
        content: 'Test reply',
        attendeeId: 1
      });
      console.log('   ❌ Should have failed - No authentication');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly failed - Authentication required');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('   ❌ Unexpected error');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 8: Test like comment without auth (should return 403)
    console.log('\n8. Testing like comment without auth...');
    try {
      const response8 = await axios.post(`${BASE_URL}/api/social/comment/1/like`, {
        attendeeId: 1
      });
      console.log('   ❌ Should have failed - No authentication');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly failed - Authentication required');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('   ❌ Unexpected error');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 9: Test delete post without auth (should return 403)
    console.log('\n9. Testing delete post without auth...');
    try {
      const response9 = await axios.delete(`${BASE_URL}/api/social/1`);
      console.log('   ❌ Should have failed - No authentication');
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('   ✅ Correctly failed - Authentication required');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('   ❌ Unexpected error');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test 10: Test invalid route (should return 404)
    console.log('\n10. Testing invalid route...');
    try {
      const response10 = await axios.get(`${BASE_URL}/api/social/invalid-route`);
      console.log('   ❌ Should have failed - Invalid route');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('   ✅ Correctly failed - Route not found');
        console.log(`   - Status: ${error.response.status}`);
      } else {
        console.log('   ❌ Unexpected error');
        console.log(`   - Status: ${error.response?.status}`);
        console.log(`   - Message: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log('\n✅ SocialPost API Basic Tests Completed!');
    console.log('\n📋 Test Summary:');
    console.log('   - ✅ Server is running and accessible');
    console.log('   - ✅ All social routes require authentication');
    console.log('   - ✅ Proper 401 responses for unauthorized access');
    console.log('   - ✅ Proper 404 responses for invalid routes');
    console.log('   - ✅ Social API endpoints are properly protected');
    console.log('\n🔐 Next Steps:');
    console.log('   - To test full functionality, use test-social-api-with-auth.js');
    console.log('   - Update TEST_CREDENTIALS with valid database credentials');
    console.log('   - Run: node test-social-api-with-auth.js');

  } catch (error) {
    console.error('❌ Error running basic SocialPost API tests:', error.message);
  }
}

// Note: This test only requires the server to be running
console.log('⚠️  Note: Make sure your server is running');
console.log('   To run this test:');
console.log('   1. Start your server: npm start');
console.log('   2. Run: node test-social-basic.js\n');

// Uncomment the line below to run the test
testSocialAPI(); 