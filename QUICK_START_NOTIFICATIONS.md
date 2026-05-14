#!/bin/bash

# Quick Integration Script for Notifications Feature

echo "🔔 Notifications Feature - Integration Guide"
echo "=============================================="
echo ""

# Step 1: Database

echo "STEP 1: Database Setup"
echo "---------------------"
echo "Execute the following SQL script in your database:"
echo "File: Database/notifications_migration.sql"
echo ""
echo "After execution, verify:"
echo " SELECT \* FROM notifications LIMIT 1;"
echo ""

# Step 2: Verify Backend Compilation

echo "STEP 2: Backend Verification"
echo "---------------------------"
echo "Run: cd backend && ./mvnw clean compile"
echo "Expected: BUILD SUCCESS ✅"
echo ""

# Step 3: Frontend Setup

echo "STEP 3: Frontend Setup"
echo "---------------------"
echo "Add NotificationBell to your navigation:"
echo ""
echo "// In MainNavigationComponent.jsx or Header.jsx:"
echo "import NotificationBell from './NotificationBell';"
echo ""
echo "<header>"
echo " {/_ Other nav items _/}"
echo " <NotificationBell userId={currentUserId} />"
echo "</header>"
echo ""

# Step 4: Create Notifications

echo "STEP 4: Integration with Services"
echo "--------------------------------"
echo "Add notification creation to existing services:"
echo ""
echo "// Example in ChatService.sendMessage():"
echo "notificationService.createNotification("
echo " new CreateNotificationDTO("
echo " chat.getProvider().getId(),"
echo " NotificationType.NEW_MESSAGE.toString(),"
echo " \"رسالة جديدة\","
echo " messageContent,"
echo " chatId,"
echo " Notification.RelatedEntityType.CHAT.toString()"
echo " )"
echo ");"
echo ""

# Step 5: WebSocket Integration

echo "STEP 5: WebSocket Real-Time Updates"
echo "-----------------------------------"
echo "In your WebSocket setup:"
echo ""
echo "// After STOMP connection established:"
echo "stompClient.subscribe("
echo " \"/topic/users/\${userId}/notifications\","
echo " (message) => {"
echo " const notification = JSON.parse(message.body);"
echo " // Handle new notification"
echo " }"
echo ");"
echo ""

# Step 6: Test

echo "STEP 6: Testing"
echo "---------------"
echo "Test endpoints using curl or Postman:"
echo ""
echo "1. Get all notifications:"
echo " curl -H \"Authorization: Bearer TOKEN\" \\"
echo " http://localhost:8080/notifications"
echo ""
echo "2. Get unread count:"
echo " curl -H \"Authorization: Bearer TOKEN\" \\"
echo " http://localhost:8080/notifications/unread/count"
echo ""
echo "3. Mark as read:"
echo " curl -X PUT -H \"Authorization: Bearer TOKEN\" \\"
echo " http://localhost:8080/notifications/1/read"
echo ""

echo "✅ Integration Complete!"
echo ""
echo "For detailed documentation, see:"
echo " - NOTIFICATIONS_IMPLEMENTATION.md"
echo " - NOTIFICATIONS_FEATURE_STATUS.md"
echo ""
