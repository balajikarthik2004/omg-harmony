// Mock data for all modules

const membershipTypes = [
  'Trust Member',
  'Committee Member',
  'Volunteer',
  'Donor',
  'VIP Devotee',
  'Regular Devotee',
  'Staff Member',
];

export const mockDevotees = [
  { id: '100', name: 'Naveen Kumar', phone: '+91 95914 33122', email: 'naveen.kumar@gwcdata.ai', address: 'Hosur Main Road', city: 'Krisnagiri', state: 'Tamil Nadu', country: 'India', status: 'Active', totalDonations: 78000, lastVisit: '2026-04-18', dob: '1988-09-12', rasi: 'Kanni', nakshatra: 'Uththarai', membershipType: 'Trust Member', familyMembers: 'Father: Raghavan Kumar, Mother: Lakshmi Raghavan, Sister: Mamtha (Simmam/Magam)', familyTreeMembers: [
    { id: 'f100-1', name: 'Raghavan Kumar', relation: 'Father', dob: '1960-05-15', gender: 'Male', rasi: 'Mesham', nakshatra: 'Ashwini' },
    { id: 'f100-2', name: 'Lakshmi Raghavan', relation: 'Mother', dob: '1965-08-10', gender: 'Female', rasi: 'Rishabam', nakshatra: 'Rohini' },
    { id: 'f100-3', name: 'Mamtha', relation: 'Sister', dob: '1993-06-15', gender: 'Female', rasi: 'Simmam', nakshatra: 'Magam' },
    { id: 'f100-4', name: 'Santhosh Kumar', relation: 'Brother', dob: '1990-11-22', gender: 'Male', rasi: 'Vrichikam', nakshatra: 'Anusham' }
  ] },
  { id: '101', name: 'Santhosh Kumar', phone: '+91 87548 08098', email: 'santhosh.kumar@gwcdata.ai', address: 'Hosur Main Road', city: 'Krisnagiri', state: 'Tamil Nadu', country: 'India', status: 'Active', totalDonations: 70000, lastVisit: '2026-04-17', membershipType: 'Committee Member', familyTreeMembers: [
    { id: 'f101-1', name: 'Raghavan Kumar', relation: 'Father', dob: '1960-05-15', gender: 'Male', rasi: 'Mesham', nakshatra: 'Ashwini' },
    { id: 'f101-2', name: 'Lakshmi Raghavan', relation: 'Mother', dob: '1965-08-10', gender: 'Female', rasi: 'Rishabam', nakshatra: 'Rohini' },
    { id: 'f101-3', name: 'Mamtha', relation: 'Sister', dob: '1993-06-15', gender: 'Female', rasi: 'Simmam', nakshatra: 'Magam' },
    { id: 'f101-4', name: 'Naveen Kumar', relation: 'Brother', dob: '1988-09-12', gender: 'Male', rasi: 'Kanni', nakshatra: 'Uththarai' }
  ] },
  { id: '1', name: 'Balaji Krishnan', phone: '+91 98765 43210', email: 'balaji.krishnan@gwcdata.ai', address: 'salem Road, Krishnagiri', city: 'Krisnagiri', state: 'Tamil Nadu', country: 'India', status: 'Active', totalDonations: 245000, lastVisit: '2026-03-12', membershipType: 'Volunteer', familyTreeMembers: [
    { id: 'f1-1', name: 'Krishnan', relation: 'Father', rasi: 'Kanni', nakshatra: 'Uthiram' },
    { id: 'f1-2', name: 'Aruna', relation: 'Mother', rasi: 'Simmam', nakshatra: 'Magam' },
    { id: 'f1-3', name: 'Karthik Krishnan', relation: 'Brother', rasi: 'Dhanusu', nakshatra: 'Moolam' }
  ] },
  { id: '2', name: 'Rajan naveen', phone: '+91 87654 32109', email: 'rajan.naveen@gwcdata.ai', address: 'Anna Nagar, Chennai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', status: 'Active', totalDonations: 168000, lastVisit: '2026-03-10', membershipType: 'Donor', familyMembers: 'Spouse: Meenakshi, Son: Rahul' },
  { id: '3', name: 'Amit Patel', phone: '+91 76543 21098', email: 'amit.patel84@gmail.com', address: 'SG Highway, Ahmedabad', city: 'Ahmedabad', state: 'Gujarat', country: 'India', status: 'Active', totalDonations: 420000, lastVisit: '2026-03-14', membershipType: 'VIP Devotee', familyMembers: 'Spouse: Sunita, Daughter: Ananya' },
  { id: '4', name: 'Sunita Reddy', phone: '+91 65432 10987', email: 'sunita.reddy.hyd@outlook.com', address: 'Banjara Hills, Hyderabad', city: 'Hyderabad', state: 'Telangana', country: 'India', status: 'Inactive', totalDonations: 132000, lastVisit: '2026-01-15', membershipType: 'Regular Devotee' },
  { id: '5', name: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram.singh.delhi@yahoo.com', address: 'Connaught Place, Delhi', city: 'Delhi', state: 'Delhi', country: 'India', status: 'Active', totalDonations: 286000, lastVisit: '2026-03-13', membershipType: 'Staff Member' },
  { id: '6', name: 'Kavitha Nair', phone: '+91 91234 56780', email: 'kavitha.nair27@gmail.com', address: 'Panampilly Nagar, Kochi', city: 'Kochi', state: 'Kerala', country: 'India', status: 'Active', totalDonations: 164000, lastVisit: '2026-03-18', membershipType: 'Trust Member' },
  { id: '7', name: 'Balaji', phone: '+91 93456 78120', email: 'kbalajikbalaji879@gmail.com', address: 'MVP Colony, Visakhapatnam', city: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', status: 'Active', totalDonations: 121000, lastVisit: '2026-03-16', membershipType: 'Committee Member' },
  { id: '8', name: 'Lalitha Iyer', phone: '+91 99887 66554', email: 'lalitha.iyer.chennai@gmail.com', address: 'Mylapore, Chennai', city: 'Chennai', state: 'Tamil Nadu', country: 'India', status: 'Active', totalDonations: 385000, lastVisit: '2026-03-20', membershipType: 'Volunteer' },
  { id: '9', name: 'Nitin Joshi', phone: '+91 90123 45098', email: 'nitin.joshi.pune@yahoo.com', address: 'Kothrud, Pune', city: 'Pune', state: 'Maharashtra', country: 'India', status: 'Inactive', totalDonations: 98000, lastVisit: '2025-12-11', membershipType: 'Donor' },
  ...Array.from({ length: 21 }).map((_, i) => ({
    id: String(i + 10),
    name: ['Deepak Verma', 'Shelly George', 'Arun Prasath', 'Meera Krishnan', 'Suresh Mani', 'Ganesh Acharya', 'Vidya Sagar'][i % 7] + ' ' + String.fromCharCode(65 + i),
    phone: `+91 9845${i % 10} ${Math.floor(10000 + Math.random() * 89999)}`,
    email: `${['deepak.verma', 'shelly.george', 'arun.prasath', 'meera.krishnan', 'suresh.mani', 'ganesh.acharya', 'vidya.sagar'][i % 7]}${(i % 5) + 1}@${['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'][i % 4]}`,
    address: `${i + 10}, Temple Street`,
    city: 'City Name',
    state: 'State',
    country: 'India',
    status: 'Active',
    totalDonations: 30000 + (i * 5000),
    lastVisit: '2026-03-20',
    membershipType: membershipTypes[i % membershipTypes.length],
  }))
];

export const mockStaffMembers = Array.from({ length: 48 }).map((_, i) => ({
  id: `S${String(i + 1).padStart(3, '0')}`,
  name: `Staff Member ${i + 1}`,
  role: i % 5 === 0 ? 'Manager' : i % 3 === 0 ? 'Admin' : 'Staff',
  status: 'Active'
}));

export const mockComplaints = Array.from({ length: 32 }).map((_, i) => ({
  id: `CMP-${String(i + 1).padStart(3, '0')}`,
  subject: i % 3 === 0 ? 'Cleaning Required' : i % 2 === 0 ? 'Booking Issue' : 'Donation Receipt Missing',
  devoteeName: 'Devotee ' + (i + 1),
  status: i % 4 === 0 ? 'Open' : i % 2 === 0 ? 'Resolved' : 'Pending',
  date: `2026-03-${String((i % 20) + 1).padStart(2, '0')}`
}));

export const mockServices = [
  { id: '1', name: 'Ganesh Pooja', description: 'Special Ganesh Chaturthi pooja', price: 1100, duration: '1 hour', status: 'Active' },
  { id: '2', name: 'Satyanarayana Pooja', description: 'Full Satyanarayana Vrat Katha', price: 2500, duration: '2 hours', status: 'Active' },
  { id: '3', name: 'Abhishekam', description: 'Sacred milk and water abhishekam', price: 500, duration: '30 mins', status: 'Active' },
  { id: '4', name: 'Homam', description: 'Fire ritual with sacred mantras', price: 5000, duration: '3 hours', status: 'Active' },
  { id: '5', name: 'Archana', description: 'Name-specific archana with flowers', price: 100, duration: '15 mins', status: 'Active' },
];

export const mockBookings = [
  { id: 'BK001', devoteeName: 'Balaji', serviceName: 'Ganesh Pooja', date: '2026-03-15', time: '09:00 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK002', devoteeName: 'Priya Sharma', serviceName: 'Abhishekam', date: '2026-03-16', time: '07:00 AM', paymentStatus: 'Pending', bookingStatus: 'Pending' },
  { id: 'BK003', devoteeName: 'Amit Patel', serviceName: 'Homam', date: '2026-03-17', time: '06:00 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK004', devoteeName: 'Sunita Reddy', serviceName: 'Satyanarayana Pooja', date: '2026-03-18', time: '10:00 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK005', devoteeName: 'Vikram Singh', serviceName: 'Archana', date: '2026-03-14', time: '08:00 AM', paymentStatus: 'Refunded', bookingStatus: 'Cancelled' },
  { id: 'BK006', devoteeName: 'Kavitha Nair', serviceName: 'Lakshmi Homam', date: '2026-03-21', time: '11:00 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK007', devoteeName: 'Lalitha Iyer', serviceName: 'Rudrabhishekam', date: '2026-03-22', time: '05:30 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK008', devoteeName: 'Harish Rao', serviceName: 'Navagraha Shanti', date: '2026-03-23', time: '09:30 AM', paymentStatus: 'Pending', bookingStatus: 'Pending' },
  { id: 'BK009', devoteeName: 'Nitin Joshi', serviceName: 'Ganesh Pooja', date: '2026-03-24', time: '07:30 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK010', devoteeName: 'Balaji', serviceName: 'Rudrabhishekam', date: '2026-03-25', time: '06:00 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK011', devoteeName: 'Priya Sharma', serviceName: 'Satyanarayana Pooja', date: '2026-03-26', time: '10:30 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK012', devoteeName: 'Amit Patel', serviceName: 'Lakshmi Homam', date: '2026-03-27', time: '09:00 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK013', devoteeName: 'Sunita Reddy', serviceName: 'Archana', date: '2026-03-28', time: '08:15 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK014', devoteeName: 'Vikram Singh', serviceName: 'Abhishekam', date: '2026-03-29', time: '07:45 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK015', devoteeName: 'Kavitha Nair', serviceName: 'Navagraha Shanti', date: '2026-03-30', time: '09:15 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK016', devoteeName: 'Harish Rao', serviceName: 'Satyanarayana Pooja', date: '2026-03-31', time: '11:30 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK017', devoteeName: 'Lalitha Iyer', serviceName: 'Chandi Homam', date: '2026-04-01', time: '06:30 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK018', devoteeName: 'Nitin Joshi', serviceName: 'Archana', date: '2026-04-02', time: '08:00 AM', paymentStatus: 'Pending', bookingStatus: 'Pending' },
  { id: 'BK019', devoteeName: 'Balaji', serviceName: 'Navagraha Shanti', date: '2026-04-03', time: '09:00 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK020', devoteeName: 'Balaji', serviceName: 'Satyanarayana Pooja', date: '2026-04-09', time: '10:30 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK021', devoteeName: 'Priya Sharma', serviceName: 'Archana', date: '2026-04-04', time: '07:15 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK022', devoteeName: 'Priya Sharma', serviceName: 'Ganapathi Homam', date: '2026-04-10', time: '09:45 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK023', devoteeName: 'Amit Patel', serviceName: 'Rudrabhishekam', date: '2026-04-05', time: '06:15 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK024', devoteeName: 'Amit Patel', serviceName: 'Satyanarayana Pooja', date: '2026-04-11', time: '11:00 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK025', devoteeName: 'Sunita Reddy', serviceName: 'Ganesh Pooja', date: '2026-04-06', time: '08:20 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK026', devoteeName: 'Sunita Reddy', serviceName: 'Abhishekam', date: '2026-04-12', time: '07:40 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK027', devoteeName: 'Vikram Singh', serviceName: 'Navagraha Shanti', date: '2026-04-07', time: '09:30 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK028', devoteeName: 'Vikram Singh', serviceName: 'Rudrabhishekam', date: '2026-04-13', time: '06:10 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK029', devoteeName: 'Kavitha Nair', serviceName: 'Satyanarayana Pooja', date: '2026-04-08', time: '10:10 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK030', devoteeName: 'Kavitha Nair', serviceName: 'Abhishekam', date: '2026-04-14', time: '07:00 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK031', devoteeName: 'Harish Rao', serviceName: 'Ganapathi Homam', date: '2026-04-09', time: '09:20 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK032', devoteeName: 'Harish Rao', serviceName: 'Archana', date: '2026-04-15', time: '08:00 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK033', devoteeName: 'Lalitha Iyer', serviceName: 'Satyanarayana Pooja', date: '2026-04-10', time: '10:20 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK034', devoteeName: 'Lalitha Iyer', serviceName: 'Navagraha Shanti', date: '2026-04-16', time: '09:50 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK035', devoteeName: 'Nitin Joshi', serviceName: 'Abhishekam', date: '2026-04-11', time: '07:25 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK036', devoteeName: 'Nitin Joshi', serviceName: 'Ganesh Pooja', date: '2026-04-17', time: '08:40 AM', paymentStatus: 'Paid', bookingStatus: 'Completed' },
  { id: 'BK037', devoteeName: 'Naveen Kumar', serviceName: 'Satyanarayana Pooja', date: '2026-04-19', time: '10:45 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK038', devoteeName: 'Naveen Kumar', serviceName: 'Rudrabhishekam', date: '2026-04-25', time: '06:30 AM', paymentStatus: 'Pending', bookingStatus: 'Pending' },
  { id: 'BK039', devoteeName: 'Santhosh Kumar', serviceName: 'Ganesh Pooja', date: '2026-04-20', time: '08:15 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
  { id: 'BK040', devoteeName: 'Santhosh Kumar', serviceName: 'Navagraha Shanti', date: '2026-04-27', time: '09:40 AM', paymentStatus: 'Paid', bookingStatus: 'Confirmed' },
];

export const mockDonations = [
  { id: '1', donationCode: 'DN001', donorName: 'Balaji Krishnan', phone: '+91 98765 43210', email: 'balaji.krishnan@gwcdata.ai', amount: 155000, category: 'Annadanam', channel: 'Online', paymentMethod: 'UPI', gateway: 'PhonePe', transactionRef: 'TXN-982136', paymentStatus: 'Success', receiptNumber: 'RC-0001', date: '2026-03-22', notes: 'Monthly patron contribution.' },
  { id: '2', donationCode: 'DN002', donorName: 'Amit Patel', phone: '+91 76543 21098', email: 'amit.patel84@gmail.com', amount: 120000, category: 'General', channel: 'Online', paymentMethod: 'Card', gateway: 'Razorpay', transactionRef: 'TXN-876231', paymentStatus: 'Success', receiptNumber: 'RC-0002', date: '2026-03-18', notes: 'Special Seva donation.' },
  { id: '3', donationCode: 'DN003', donorName: 'Rajan naveen', phone: '+91 87654 32109', email: 'rajan.naveen@gwcdata.ai', amount: 68000, category: 'Temple Renovation', channel: 'Counter', paymentMethod: 'Cash', gateway: 'Temple POS', transactionRef: '-', paymentStatus: 'Success', receiptNumber: 'RC-0003', date: '2026-03-10', notes: '' },
  { id: '4', donationCode: 'DN004', donorName: 'Sunita Reddy', phone: '+91 65432 10987', email: 'sunita.reddy.hyd@outlook.com', amount: 32000, category: 'Festival Fund', channel: 'Online', paymentMethod: 'UPI', gateway: 'PhonePe', transactionRef: 'TXN-123456', paymentStatus: 'Success', receiptNumber: 'RC-0004', date: '2026-02-15', notes: 'Sankranti donation.' },
  { id: '5', donationCode: 'DN005', donorName: 'Kavitha Nair', phone: '+91 91234 56780', email: 'kavitha.nair27@gmail.com', amount: 84000, category: 'Annadanam', channel: 'Online', paymentMethod: 'Card', gateway: 'Razorpay', transactionRef: 'TXN-998877', paymentStatus: 'Success', receiptNumber: 'RC-0005', date: '2026-03-28', notes: 'Birthday seva.' },
  { id: '6', donationCode: 'DN006', donorName: 'Lalitha Iyer', phone: '+91 99887 66554', email: 'lalitha.iyer.chennai@gmail.com', amount: 245000, category: 'General', channel: 'Counter', paymentMethod: 'Card', gateway: 'Temple POS', transactionRef: 'TXN-334455', paymentStatus: 'Success', receiptNumber: 'RC-0006', date: '2026-03-29', notes: 'Annual family contribution.' },
  { id: '7', donationCode: 'DN007', donorName: 'Vikram Singh', phone: '+91 54321 09876', email: 'vikram.singh.delhi@yahoo.com', amount: 46000, category: 'Medical Aid', channel: 'Counter', paymentMethod: 'Cash', gateway: 'Temple POS', transactionRef: '-', paymentStatus: 'Success', receiptNumber: 'RC-0007', date: '2026-03-12', notes: '' },
  { id: '8', donationCode: 'DN008', donorName: 'Naveen Kumar', phone: '+91 95914 33122', email: 'naveen.kumar@gwcdata.ai', amount: 35000, category: 'Education', channel: 'Online', paymentMethod: 'UPI', gateway: 'PhonePe', transactionRef: 'TXN-554433', paymentStatus: 'Success', receiptNumber: 'RC-0008', date: '2026-04-02', notes: 'Vidyadhanam Seva.' },
  { id: '9', donationCode: 'DN009', donorName: 'Balaji Krishnan', phone: '+91 98765 43210', email: 'balaji.krishnan@gwcdata.ai', amount: 50000, category: 'Annadanam', channel: 'Online', paymentMethod: 'UPI', gateway: 'PhonePe', transactionRef: 'TXN-221100', paymentStatus: 'Success', receiptNumber: 'RC-0009', date: '2026-04-05', notes: '' },
  { id: '10', donationCode: 'DN010', donorName: 'Amit Patel', phone: '+91 76543 21098', email: 'amit.patel84@gmail.com', amount: 95000, category: 'General', channel: 'Online', paymentMethod: 'Card', gateway: 'Razorpay', transactionRef: 'TXN-776655', paymentStatus: 'Success', receiptNumber: 'RC-0010', date: '2026-04-03', notes: '' },
  { id: '11', donationCode: 'DN011', donorName: 'Shelly George', phone: '+91 98451 12345', email: 'shelly.george@gmail.com', amount: 15000, category: 'General', channel: 'Hundi', paymentMethod: 'Cash', gateway: 'Temple POS', transactionRef: '-', paymentStatus: 'Success', receiptNumber: 'RC-0011', date: '2026-03-25', notes: 'Hundi donation.' },
  { id: '12', donationCode: 'DN012', donorName: 'Nitin Joshi', phone: '+91 90123 45098', email: 'nitin.joshi.pune@yahoo.com', amount: 12000, category: 'General', channel: 'Online', paymentMethod: 'UPI', gateway: 'PhonePe', transactionRef: 'TXN-009988', paymentStatus: 'Success', receiptNumber: 'RC-0012', date: '2025-12-10', notes: 'Inactive donor seed.' },
];

export const mockEvents = [
  { id: '1', name: 'Maha Shivaratri', description: 'Grand celebration of Lord Shiva', date: '2026-03-20', time: '06:00 AM', location: 'Main Temple Hall', organizer: 'Head Priest', status: 'Scheduled' },
  { id: '2', name: 'Satyanarayana Pooja', description: 'Monthly community pooja', date: '2026-03-25', time: '10:00 AM', location: 'Prayer Hall', organizer: 'Temple Committee', status: 'Planned' },
  { id: '3', name: 'Navratri Festival', description: '9-day festival celebration', date: '2026-04-06', time: '05:00 AM', location: 'Entire Temple', organizer: 'Festival Committee', status: 'Planned' },
  { id: '4', name: 'Hanuman Jayanti', description: 'Birthday of Lord Hanuman', date: '2026-04-14', time: '06:00 AM', location: 'Hanuman Shrine', organizer: 'Head Priest', status: 'Planned' },
  { id: '5', name: 'Rama Navami', description: 'Special bhajans and procession', date: '2026-04-17', time: '07:00 AM', location: 'Main Courtyard', organizer: 'Bhajan Group', status: 'Scheduled' },
  { id: '6', name: 'Annadanam Seva Day', description: 'Mass meal distribution drive', date: '2026-04-21', time: '11:30 AM', location: 'Dining Hall', organizer: 'Seva Committee', status: 'Planned' },
];

export const mockTasks = [
  { id: '1', name: 'Morning Aarti', assignedTo: 'Pandit Sharma', dueDate: '2026-03-14', time: '05:30 AM', status: 'Completed', type: 'pooja' as const },
  { id: '2', name: 'Evening Aarti', assignedTo: 'Pandit Verma', dueDate: '2026-03-14', time: '06:30 PM', status: 'Pending', type: 'pooja' as const },
  { id: '3', name: 'Noon Bhog', assignedTo: 'Kitchen Staff', dueDate: '2026-03-14', time: '12:00 PM', status: 'In Progress', type: 'pooja' as const },
  { id: '4', name: 'Clean main hall', assignedTo: 'Ramu', dueDate: '2026-03-15', status: 'Pending', type: 'general' as const },
  { id: '5', name: 'Update donation records', assignedTo: 'Seema', dueDate: '2026-03-14', status: 'In Progress', type: 'general' as const },
  { id: '6', name: 'Flower arrangement', assignedTo: 'Lakshmi', dueDate: '2026-03-14', status: 'Completed', type: 'general' as const },
  { id: '7', name: 'Prepare prasadam counters', assignedTo: 'Kitchen Staff', dueDate: '2026-03-21', status: 'Pending', type: 'general' as const },
  { id: '8', name: 'Evening deeparadhana setup', assignedTo: 'Pandit Iyer', dueDate: '2026-03-21', time: '05:45 PM', status: 'In Progress', type: 'pooja' as const },
  { id: '9', name: 'Volunteer roster finalization', assignedTo: 'Admin Team', dueDate: '2026-03-22', status: 'Pending', type: 'general' as const },
];

export const mockInventory = [
  { id: '1', name: 'Camphor', category: 'Pooja Items', quantity: 50, unit: 'packets', stockStatus: 'In Stock', supplier: 'Shree Suppliers' },
  { id: '2', name: 'Ghee', category: 'Pooja Items', quantity: 5, unit: 'liters', stockStatus: 'Low Stock', supplier: 'Dairy Fresh' },
  { id: '3', name: 'Flowers (Marigold)', category: 'Pooja Items', quantity: 200, unit: 'bundles', stockStatus: 'In Stock', supplier: 'Garden Fresh' },
  { id: '4', name: 'Incense Sticks', category: 'Pooja Items', quantity: 8, unit: 'boxes', stockStatus: 'Low Stock', supplier: 'Agarbatti House' },
  { id: '5', name: 'Rice', category: 'Kitchen', quantity: 100, unit: 'kg', stockStatus: 'In Stock', supplier: 'Grain Mart' },
  { id: '6', name: 'Coconuts', category: 'Pooja Items', quantity: 3, unit: 'dozens', stockStatus: 'Low Stock', supplier: 'Fresh Fruits' },
  { id: '7', name: 'Banana Leaves', category: 'Kitchen', quantity: 120, unit: 'pieces', stockStatus: 'In Stock', supplier: 'Green Leaf Traders' },
  { id: '8', name: 'Sesame Oil', category: 'Pooja Items', quantity: 9, unit: 'liters', stockStatus: 'Low Stock', supplier: 'Ayyappa Oils' },
  { id: '9', name: 'Turmeric Powder', category: 'Pooja Items', quantity: 15, unit: 'packets', stockStatus: 'In Stock', supplier: 'Shubham Stores' },
  { id: '10', name: 'Jaggery', category: 'Kitchen', quantity: 25, unit: 'kg', stockStatus: 'In Stock', supplier: 'Sweet Source' },
];

export const mockAssets = [
  { id: '1', name: 'Main Temple Bell', category: 'Temple Fixtures', purchaseDate: '2020-01-15', condition: 'Good', maintenanceStatus: 'Up to Date' },
  { id: '2', name: 'Sound System', category: 'Electronics', purchaseDate: '2023-06-20', condition: 'Excellent', maintenanceStatus: 'Up to Date' },
  { id: '3', name: 'Generator 5KVA', category: 'Electrical', purchaseDate: '2022-03-10', condition: 'Good', maintenanceStatus: 'Due Soon' },
  { id: '4', name: 'CCTV Camera Set', category: 'Security', purchaseDate: '2024-01-05', condition: 'Excellent', maintenanceStatus: 'Up to Date' },
  { id: '5', name: 'Kitchen Equipment', category: 'Kitchen', purchaseDate: '2021-08-15', condition: 'Fair', maintenanceStatus: 'Overdue' },
  { id: '6', name: 'Temple Van', category: 'Vehicle', purchaseDate: '2022-11-20', condition: 'Good', maintenanceStatus: 'Due Soon' },
  { id: '7', name: 'Silver Deepam Set', category: 'Temple Fixtures', purchaseDate: '2019-09-12', condition: 'Excellent', maintenanceStatus: 'Up to Date' },
  { id: '8', name: 'Farmland Parcel A', category: 'Land', purchaseDate: '2015-02-18', condition: 'Good', maintenanceStatus: 'Up to Date' },
];

export const donationTrendData = [
  { month: 'Oct', amount: 320000 },
  { month: 'Nov', amount: 450000 },
  { month: 'Dec', amount: 680000 },
  { month: 'Jan', amount: 520000 },
  { month: 'Feb', amount: 410000 },
  { month: 'Mar', amount: 590000 },
  { month: 'Apr', amount: 640000 },
  { month: 'May', amount: 615000 },
];

export const donationCategoryData = [
  { name: 'General', value: 45, color: 'hsl(1, 76%, 52%)' },
  { name: 'Annadanam', value: 25, color: 'hsl(233, 53%, 35%)' },
  { name: 'Renovation', value: 15, color: 'hsl(270, 43%, 32%)' },
  { name: 'Festival Fund', value: 15, color: 'hsl(40, 70%, 50%)' },
];

export const serviceBookingData = [
  { service: 'Archana', bookings: 120 },
  { service: 'Abhishekam', bookings: 85 },
  { service: 'Homam', bookings: 45 },
  { service: 'Ganesh Pooja', bookings: 65 },
  { service: 'Satyanarayan', bookings: 55 },
  { service: 'Rudrabhishekam', bookings: 42 },
  { service: 'Navagraha Shanti', bookings: 38 },
];

export const inventoryUsageData = [
  { item: 'Camphor', used: 40, remaining: 50 },
  { item: 'Ghee', used: 15, remaining: 5 },
  { item: 'Flowers', used: 150, remaining: 200 },
  { item: 'Incense', used: 12, remaining: 8 },
  { item: 'Coconuts', used: 9, remaining: 3 },
  { item: 'Sesame Oil', used: 8, remaining: 9 },
  { item: 'Rice', used: 85, remaining: 100 },
  { item: 'Jaggery', used: 12, remaining: 25 },
];
