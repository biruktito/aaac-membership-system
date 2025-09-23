# AAAC Membership System - Financial Rules & Documentation

## Overview
The AAAC Membership System v2 implements a comprehensive financial tracking system with role-based access control, real-time updates, and automated financial calculations.

## Financial Calculation Rules

### Core Constants
- **Monthly Dues**: $15.00 per month
- **Current Month**: September 2025 (2025-09)
- **Inactive Threshold**: 36 months without payment (since October 2022)

### Baseline Calculation
The dues baseline is calculated as:
```
baseline = max(member.startDate, firstPaymentMonth)
```
- `member.startDate`: The member's official start date
- `firstPaymentMonth`: The earliest month with any payment >= $15

### Financial Fields

#### `startAt`
- **Type**: String (YYYY-MM format)
- **Calculation**: `monthKey(baseline)`
- **Purpose**: The month from which dues are calculated

#### `totalOwed`
- **Type**: Number
- **Calculation**: `owedMonthsArray.length * 15`
- **Purpose**: Total amount owed from baseline to current month

#### `paidTowardOwed`
- **Type**: Number
- **Calculation**: Sum of actual payments within the owed window
- **Purpose**: Amount paid toward owed months (excludes future credit)

#### `futureCredit`
- **Type**: Number
- **Calculation**: Sum of payments made after current month
- **Purpose**: Payments made for future months

#### `balance`
- **Type**: Number
- **Calculation**: `(paidTowardOwed + futureCredit) - totalOwed`
- **Purpose**: Current financial position (positive = ahead, negative = behind)

#### `monthsCovered`
- **Type**: Number
- **Calculation**: Count of months with payments >= $15 within owed window
- **Purpose**: Number of months fully paid

#### `monthsBehind`
- **Type**: Number
- **Calculation**: `max(0, owedMonthsArray.length - monthsCovered)`
- **Purpose**: Number of months behind in payments

#### `paidUpTo`
- **Type**: String (YYYY-MM format) or null
- **Calculation**: Latest month with payment >= $15 (can be future)
- **Purpose**: Display the most recent month with full payment

#### `status`
- **Type**: String
- **Values**:
  - `"inactive"`: Manual flag (`!isActive`) OR lapsed (>36 months without payment)
  - `"ahead"`: `balance > 0`
  - `"current"`: `balance >= 0 AND monthsBehind = 0`
  - `"behind"`: `balance < 0 AND monthsBehind 1-2`
  - `"issue"`: `balance < 0 AND monthsBehind 3-5`
  - `"risk"`: `balance < 0 AND monthsBehind >= 6`

#### `active`
- **Type**: Boolean
- **Calculation**: Any payment > $0 in last 36 months
- **Purpose**: Determines if member is considered active

#### `ignored`
- **Type**: Boolean
- **Calculation**: `monthsBehind > 36`
- **Purpose**: Excludes member from aggregate calculations

## Payment Allocation Logic

### Dollar-Based Allocation
When a payment is made, it's allocated using the following priority:

1. **Oldest Unpaid Months First**: Fill months from baseline forward
2. **Future Months**: If payment exceeds owed amount, allocate to future months
3. **Per-Month Cap**: Maximum $15 per month allocation

### Payment Types
- **Monthly**: Allocated using dollar-based logic
- **Registration**: Logged to `registrationPayments` array
- **Incidental**: Logged to `incidentalPayments` array

## Role-Based Access Control (RBAC)

### Anonymous Users
- **Data Access**: None (shows "Please sign in" message)
- **Actions**: None
- **UI**: Login buttons only

### Members (`role: "member"`)
- **Data Access**: Own record only (via `memberId` linkage)
- **Actions**: 
  - View payment information
  - Contact admin
- **UI**: Member-specific stats, no admin controls

### Board Members (`role: "board"`)
- **Data Access**: All member records
- **Actions**:
  - Generate reminders
  - View all data
- **UI**: Full member list, filters, stats

### Administrators (`role: "admin"`)
- **Data Access**: All member records
- **Actions**:
  - Record payments
  - Generate reminders
  - Export data
  - Manage roles
- **UI**: Full admin interface

## Authentication Methods

### Email/Password
- Standard Firebase Auth
- Role assigned via `roles/{uid}` document

### Phone + MemberID Claim
- Passwordless authentication
- Validates phone number against member record
- Creates `roles/{uid}` document with `memberId` linkage

## Data Sources

### Primary: Firebase Firestore
- Real-time updates
- Multi-user synchronization
- Transactional writes

### Fallback: Local JSON
- `docs/cleaned_members_final_normalized.json`
- Used when Firestore is empty or unavailable
- 101 members with normalized data

## UI Components

### Admin/Board View
- **Stats**: Total members, current, behind, owed amount
- **Filters**: By status, search by name/ID
- **Actions**: Record payment, generate reminder, export
- **List**: All members with financial details

### Member View
- **Stats**: Personal stats only (1 member, own status)
- **Actions**: View payment info, contact admin
- **List**: Own record only

### Realtime Updates
- **Visual Indicator**: "✓ Updated" appears on data changes
- **Immediate Refresh**: UI updates instantly after payments
- **Cross-User Sync**: Changes from other users appear automatically

## Technical Implementation

### Key Functions
- `calculateMemberFinancials(member)`: Core financial calculations
- `distributeToUnpaidMonths(amount, payments)`: Payment allocation
- `attachRealtime()`: Admin/board realtime listener
- `attachMemberRealtime(memberId)`: Member-only realtime listener
- `renderStats(members)`: Display aggregate statistics
- `renderList(members)`: Display member list

### Data Flow
1. **Load**: Firestore → Local cache → UI render
2. **Update**: User action → Firebase write → Local update → UI refresh
3. **Sync**: Firestore change → Realtime listener → UI update

## Error Handling

### Validation
- Member ID must exist
- Full name must be present
- Phone numbers normalized (digits only, 10-14 digits)
- Payment amounts must be positive

### Fallbacks
- Firestore unavailable → Local JSON
- Invalid member data → Skip with warning
- Network errors → Retry with user notification

## Security Considerations

### Firestore Rules
- Read access: Authenticated users only
- Write access: Admin role required
- Member role: Can only create/update own `roles/{uid}` document

### Data Privacy
- Members only see their own data
- Anonymous users see no member data
- Admin actions logged with user attribution

## Performance Optimizations

### Caching
- Local member data cache
- Computed financials cached per member
- UI updates batched

### Real-time Efficiency
- Single Firestore listener per view type
- Minimal data transfer
- Optimistic UI updates

## Future Enhancements

### Planned Features
- Phone number validation and normalization
- Bulk data validation and recomputation
- Advanced reporting and analytics
- Email integration for reminders
- Mobile-responsive design improvements

### Scalability Considerations
- Pagination for large member lists
- Background financial recalculation
- Audit trail for all changes
- Backup and recovery procedures



