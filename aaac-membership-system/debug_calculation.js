// Debug the calculation logic
const members = [
  {
    memberId: '1',
    fullName: 'HABTAMU BAKANA',
    paymentsDues: {
      '2019-02': 15, '2019-03': 15, '2019-04': 15, '2019-05': 15, '2019-06': 15,
      '2019-07': 15, '2019-08': 15, '2019-09': 15, '2019-10': 15, '2019-11': 15,
      '2019-12': 15, '2020-01': 15, '2020-02': 15, '2020-03': 15, '2020-04': 15,
      '2020-05': 15, '2020-06': 15, '2020-07': 15, '2020-08': 15, '2020-09': 15,
      '2020-10': 15, '2020-11': 15, '2020-12': 15, '2021-01': 15, '2021-02': 15,
      '2021-03': 15, '2021-04': 15, '2021-05': 15, '2021-06': 15, '2021-07': 15,
      '2021-08': 15, '2021-09': 15, '2021-10': 15, '2021-11': 15, '2021-12': 15,
      '2022-01': 15, '2022-02': 15, '2022-03': 15, '2022-04': 15, '2022-05': 15,
      '2022-06': 15, '2022-07': 15, '2022-08': 15, '2022-09': 15, '2022-10': 15,
      '2022-11': 15, '2022-12': 15, '2023-01': 15, '2023-02': 15, '2023-03': 15,
      '2023-04': 15, '2023-05': 15, '2023-06': 15, '2023-07': 15, '2023-08': 15,
      '2023-09': 15, '2023-10': 15, '2023-11': 15, '2023-12': 15, '2024-01': 15,
      '2024-02': 15, '2024-03': 15, '2024-04': 15, '2024-05': 15, '2024-06': 15,
      '2024-07': 15, '2024-08': 15, '2024-09': 15, '2024-10': 15, '2024-11': 15,
      '2024-12': 15, '2025-01': 15, '2025-02': 15, '2025-03': 15, '2025-04': 15,
      '2025-05': 15, '2025-06': 15, '2025-07': 15, '2025-08': 15, '2025-09': 15,
      '2025-10': 15, '2025-11': 15, '2025-12': 15, '2026-01': 15, '2026-02': 15
    },
    isActive: true
  }
];

const CURRENT_DATE = new Date('2025-09-01T00:00:00Z');
const DUE_PER_MONTH = 15;

function monthKey(date) { 
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`; 
}

function calculateMemberFinancials(member) {
  const payments = member.paymentsDues || {};
  
  // Find the earliest payment date to determine membership start
  let earliestPaymentDate = null;
  Object.keys(payments).forEach(key => {
    if (payments[key] > 0) {
      const [year, month] = key.split('-').map(Number);
      const paymentDate = new Date(Date.UTC(year, month - 1, 1));
      if (!earliestPaymentDate || paymentDate < earliestPaymentDate) {
        earliestPaymentDate = paymentDate;
      }
    }
  });
  
  // Use the actual first payment date as membership start
  const actualStart = earliestPaymentDate || new Date('2019-01-01T00:00:00Z');
  
  const iter = new Date(Date.UTC(actualStart.getUTCFullYear(), actualStart.getUTCMonth(), 1));
  const end = new Date(Date.UTC(CURRENT_DATE.getUTCFullYear(), CURRENT_DATE.getUTCMonth(), 1));
  
  let totalOwed = 0;
  let totalPaid = 0;
  let monthsBehind = 0;
  let paidUpTo = null;
  let currentMonth = new Date(Date.UTC(CURRENT_DATE.getUTCFullYear(), CURRENT_DATE.getUTCMonth(), 1));

  // Calculate from actual start date to current month
  while (iter <= end) {
    const key = monthKey(iter);
    const paid = Number(payments[key] || 0);
    totalPaid += paid;
    totalOwed += DUE_PER_MONTH;
    
    if (paid >= DUE_PER_MONTH) {
      paidUpTo = new Date(iter);
    } else {
      monthsBehind += 1;
    }
    iter.setUTCMonth(iter.getUTCMonth() + 1);
  }

  // Check future payments to extend paidUpTo
  const currentKey = monthKey(currentMonth);
  const futureKeys = Object.keys(payments).filter(k => k > currentKey).sort();
  for (const k of futureKeys) {
    if (Number(payments[k] || 0) >= DUE_PER_MONTH) {
      const [y, m] = k.split('-').map(Number);
      paidUpTo = new Date(Date.UTC(y, m - 1, 1));
    } else {
      break;
    }
  }

  // Calculate balance: positive = ahead, negative = owes
  const balance = totalPaid - totalOwed;

  // Determine status
  let status = 'current';
  if (!member.isActive) {
    status = 'inactive';
  } else if (balance < 0) {
    if (monthsBehind >= 6) status = 'risk';
    else if (monthsBehind >= 3) status = 'issue';
    else status = 'behind';
  } else if (balance > 0) {
    status = 'ahead';
  }

  return { 
    balance, 
    monthsBehind, 
    paidUpTo, 
    status, 
    totalOwed, 
    totalPaid 
  };
}

// Test the calculation
const result = calculateMemberFinancials(members[0]);
console.log('Calculation result:');
console.log('Balance:', result.balance);
console.log('Months behind:', result.monthsBehind);
console.log('Paid up to:', result.paidUpTo ? result.paidUpTo.toISOString().substring(0,7) : 'None');
console.log('Status:', result.status);
console.log('Total paid:', result.totalPaid);
console.log('Total owed:', result.totalOwed);


