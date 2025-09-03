# Event Management Guide for Board Members & Admins

## How to Create and Post Events

### Step-by-Step Process:

1. **Login as Admin or Board Member**
   - Username: `aaacadmin` (for admin) or `aaacboard` (for board)
   - Password: `admin2025` (for admin) or `board2025` (for board)

2. **Access the Dashboard**
   - After login, you'll see the main dashboard
   - Look for the "Add Event" button in the admin actions section

3. **Create a New Event**
   - Click the **"Add Event"** button
   - A modal will open with the event creation form
   - Fill in the required information:
     - **Event Date**: Select the date using the date picker
     - **Event Title**: Enter a clear, descriptive title
     - **Description**: Add details about the event (location, time, etc.)

4. **Save the Event**
   - Click **"Save Event"** to create the event
   - The event will be immediately visible to all members

### Event Types You Can Create:

- **Monthly Meetings**: Regular association meetings
- **Special Events**: Cultural celebrations, fundraisers, etc.
- **Payment Reminders**: Important payment deadlines
- **Community Events**: Social gatherings, workshops, etc.
- **Emergency Notifications**: Important announcements

### Best Practices:

1. **Clear Titles**: Use descriptive titles like "Monthly Meeting" or "Ethiopian New Year Celebration"
2. **Detailed Descriptions**: Include location, time, and any special instructions
3. **Advance Notice**: Create events well in advance so members can plan
4. **Consistent Formatting**: Follow a consistent format for similar events

### Example Events:

**Monthly Meeting:**
- Title: "Monthly Association Meeting"
- Description: "Regular monthly meeting at Ethiopian Community Center, 7:00 PM. All members welcome."

**Special Event:**
- Title: "Ethiopian New Year Celebration"
- Description: "Join us for Ethiopian New Year celebration with traditional food, music, and cultural activities. Location: Community Center, 6:00 PM."

**Payment Reminder:**
- Title: "Monthly Dues Due"
- Description: "Monthly membership fee of $15 is due. Please send payment via Zelle to aaaichicago@gmail.com"

### How Members See Events:

- **Regular Members**: See events when they log in with their member ID
- **Auto-Generated Events**: System automatically shows monthly meetings and payment due dates
- **Custom Events**: Your created events appear alongside auto-generated ones
- **Chronological Order**: Events are sorted by date automatically

### Managing Events:

- Events are stored in the browser's session storage
- They persist during the current session
- For permanent storage, consider implementing a database solution in the future

### Troubleshooting:

- **Event not appearing**: Refresh the page after creating an event
- **Permission denied**: Make sure you're logged in as admin or board member
- **Date issues**: Use the date picker to ensure correct format

### Future Enhancements:

- Event editing and deletion
- Event categories and filtering
- Email notifications for events
- Calendar integration
- Event attendance tracking

---

**Note**: This system currently stores events in the browser session. For a production environment, consider implementing server-side storage for permanent event management.
