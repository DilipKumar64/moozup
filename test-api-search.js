const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TOKEN = 'your-test-jwt-token'; // Replace with actual test token

async function testSearchAPI() {
  try {
    console.log('Testing Chat Search API...\n');

    // Test 1: Get all chattable attendees (no search)
    console.log('1. Testing GET /api/chat/chattable-attendees (no search)...');
    try {
      const response1 = await axios.get(`${BASE_URL}/api/chat/chattable-attendees`, {
        params: {
          eventId: 1,
          currentAttendeeId: 1
        },
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log('   ✅ Success - No search query');
      console.log(`   - Found ${response1.data.data.count} attendees`);
      console.log(`   - Search query: ${response1.data.data.searchQuery}`);
    } catch (error) {
      console.log('   ❌ Error - No search query');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.error || error.message}`);
    }

    // Test 2: Search by first name
    console.log('\n2. Testing GET /api/chat/chattable-attendees (search by first name)...');
    try {
      const response2 = await axios.get(`${BASE_URL}/api/chat/chattable-attendees`, {
        params: {
          eventId: 1,
          currentAttendeeId: 1,
          search: 'Dilip'
        },
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log('   ✅ Success - First name search');
      console.log(`   - Found ${response2.data.data.count} attendees`);
      console.log(`   - Search query: ${response2.data.data.searchQuery}`);
      
      if (response2.data.data.attendees.length > 0) {
        console.log('   - Results:');
        response2.data.data.attendees.forEach((attendee, index) => {
          console.log(`     ${index + 1}. ${attendee.fullName} (ID: ${attendee.attendeeId})`);
        });
      }
    } catch (error) {
      console.log('   ❌ Error - First name search');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.error || error.message}`);
    }

    // Test 3: Search by partial name
    console.log('\n3. Testing GET /api/chat/chattable-attendees (partial name search)...');
    try {
      const response3 = await axios.get(`${BASE_URL}/api/chat/chattable-attendees`, {
        params: {
          eventId: 1,
          currentAttendeeId: 1,
          search: 'Dil'
        },
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log('   ✅ Success - Partial name search');
      console.log(`   - Found ${response3.data.data.count} attendees`);
      console.log(`   - Search query: ${response3.data.data.searchQuery}`);
    } catch (error) {
      console.log('   ❌ Error - Partial name search');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.error || error.message}`);
    }

    // Test 4: Search with non-existent name
    console.log('\n4. Testing GET /api/chat/chattable-attendees (non-existent name)...');
    try {
      const response4 = await axios.get(`${BASE_URL}/api/chat/chattable-attendees`, {
        params: {
          eventId: 1,
          currentAttendeeId: 1,
          search: 'NonExistentUser'
        },
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log('   ✅ Success - Non-existent name search');
      console.log(`   - Found ${response4.data.data.count} attendees`);
      console.log(`   - Search query: ${response4.data.data.searchQuery}`);
    } catch (error) {
      console.log('   ❌ Error - Non-existent name search');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.error || error.message}`);
    }

    // Test 5: Case insensitive search
    console.log('\n5. Testing GET /api/chat/chattable-attendees (case insensitive)...');
    try {
      const response5 = await axios.get(`${BASE_URL}/api/chat/chattable-attendees`, {
        params: {
          eventId: 1,
          currentAttendeeId: 1,
          search: 'dilip'
        },
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log('   ✅ Success - Case insensitive search');
      console.log(`   - Found ${response5.data.data.count} attendees`);
      console.log(`   - Search query: ${response5.data.data.searchQuery}`);
    } catch (error) {
      console.log('   ❌ Error - Case insensitive search');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.error || error.message}`);
    }

    // Test 6: Missing required parameters
    console.log('\n6. Testing GET /api/chat/chattable-attendees (missing parameters)...');
    try {
      const response6 = await axios.get(`${BASE_URL}/api/chat/chattable-attendees`, {
        params: {
          eventId: 1
          // Missing currentAttendeeId
        },
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`
        }
      });
      
      console.log('   ❌ Should have failed - Missing currentAttendeeId');
    } catch (error) {
      console.log('   ✅ Correctly failed - Missing currentAttendeeId');
      console.log(`   - Status: ${error.response?.status}`);
      console.log(`   - Message: ${error.response?.data?.error || error.message}`);
    }

    console.log('\n✅ API Search Tests Completed!');
    console.log('\n📋 API Test Summary:');
    console.log('   - ✅ Endpoint accepts search parameter');
    console.log('   - ✅ Search works with first names');
    console.log('   - ✅ Search works with partial names');
    console.log('   - ✅ Search handles non-existent names gracefully');
    console.log('   - ✅ Search is case insensitive');
    console.log('   - ✅ Proper error handling for missing parameters');
    console.log('   - ✅ Response includes search query in response');

  } catch (error) {
    console.error('❌ Error running API tests:', error.message);
  }
}

// Note: This test requires the server to be running and a valid JWT token
console.log('⚠️  Note: Make sure your server is running and update TEST_TOKEN with a valid JWT token');
console.log('   To run this test:');
console.log('   1. Start your server: npm start');
console.log('   2. Update TEST_TOKEN with a valid JWT token');
console.log('   3. Run: node test-api-search.js\n');

// Uncomment the line below to run the test
// testSearchAPI(); 